import { FieldConfiguration, FieldConfigurationItem } from "./FieldConfiguration";
import { Project } from "./Project";
import { JiraApi } from "./JiraApi";
import { JiraCrudType } from "./JiraCrudType";
import { PageBean } from "./CrudType";
import { FieldConfigurationScheme } from "./FieldConfigurationScheme";
import { ServiceDesk } from "./ServiceDesk";

export interface RequestTypeCreateRequest {
  issueTypeId: string | number; //ID of the request type to add to the service desk.
  name: string; //Name of the request type on the service desk.
  description?: string; //Description of the request type on the service desk.
  helpText?: string; //Help text for the request type on the service desk.
  fieldItems?: FieldConfigurationItem[];
  projectKey?: string;
}

interface RequestTypeDetails {
  id: string;
  name: string;
  description: string;
  helpText: string;
  issueTypeId: string;
  serviceDeskId: string;
  groupIds: string[];
  icon: Icon;
  fields: Fields;
  practice: string;
  _expands?: string[];
  _links: Links;
}

interface Fields {
  requestTypeFields: RequestTypeField[];
  canRaiseOnBehalfOf: boolean;
  canAddRequestParticipants: boolean;
}

interface RequestTypeField {
  fieldId: string;
  name: string;
  description: string;
  required: boolean;
  defaultValues: DefaultValue[];
  validValues: DefaultValue[];
  presetValues: string[];
  jiraSchema: JiraSchema;
  visible: boolean;
}

interface JiraSchema {
  type: string;
  items: string;
  system: string;
  custom: string;
  customId: number;
  configuration: Configuration;
}

interface Configuration {}

interface DefaultValue {
  value: string;
  label: string;
  children: any[];
}

interface Icon {
  id: string;
  _links: IconUrls;
}

interface IconUrls {
  iconUrls: IconUrls;
}

interface IconUrls {
  "48x48": string;
  "24x24": string;
  "16x16": string;
  "32x32": string;
}

interface Links {
  self: string;
}

export class RequestType extends JiraCrudType<RequestTypeDetails, RequestTypeCreateRequest> {
  constructor(serviceDeskIdOrProjectKey: string) {
    super(`/rest/servicedeskapi/servicedesk/${serviceDeskIdOrProjectKey}/requesttype`);
  }
  async create({ projectKey, fieldItems, ...body }: RequestTypeCreateRequest): Promise<this> {
    if (fieldItems?.length) {
      this.createWithFieldConfig({ projectKey, fieldItems, ...body });
    } else console.log("sending request without field items");
    this.state = await JiraApi(this._defaultRestAddress, body, "POST", undefined, { experimental: true });
    return this;
  }

  async delete() {
    this.state = await JiraApi(`${this._defaultRestAddress}/${this.body.id}`, {}, "DELETE", undefined, {
      experimental: true,
    });
    return this;
  }

  //PRIVATE API. Only usable with basic auth and a suitable user, user impersonation does not seem to work
  async setGroups(groupIds: string[]): Promise<this> {
    (
      await JiraApi(
        `/rest/servicedesk/1/servicedesk/${this.body.serviceDeskId}/request-types/${this.body.id}/groups`,
        { groupIds },
        "PUT"
      )
    ).body;
    return this;
  }

  async createWithFieldConfig({ projectKey, fieldItems, ...body }: RequestTypeCreateRequest) {
    if (fieldItems && projectKey) {
      let project = await new Project().WithId(projectKey).read();
      let fieldConfigScheme = await new FieldConfigurationScheme().readByProject(project.body.id);
      let fieldConfig = await new FieldConfiguration().create({
        name: projectKey + `: Field Configuration for ` + body.name,
        description: "Crewmaker: Generated field for request type configuration.",
      });
      await fieldConfigScheme.setMapping([
        { issueTypeId: body.issueTypeId, fieldConfigurationId: fieldConfig.body.id },
      ]);
      await fieldConfig.updateFieldConfigurationItems(requiredFieldMap(fieldItems));
      this.state = await JiraApi(this._defaultRestAddress, body, "POST", undefined, { experimental: true });
      await fieldConfig.updateFieldConfigurationItems(unrequiredFieldMap(fieldItems));
    } else console.error("projectKey not specified for request type");
    return this;
  }

  static async getAll(serviceDeskIdsOrProjectKeys?: string[], searchQuery?: string) {
    let serviceDeskQuery = "?";
    if (serviceDeskIdsOrProjectKeys) {
      await Promise.all(
        serviceDeskIdsOrProjectKeys?.map(async (id) => {
          if (isNaN(Number(id))) {
            //assuming that passed value is a key not the service desk id.
            id = await new ServiceDesk()
              .WithId(id)
              .read()
              .then((serviceDesk) => serviceDesk.body.id);
          }
          serviceDeskQuery += `serviceDeskId=${id}&`;
          return Promise.resolve();
        })
      );
    }
    if (searchQuery && searchQuery.length) {
      searchQuery = `query=${searchQuery}`;
    }
    return (
      await JiraApi<PageBean<RequestTypeDetails>>(
        `/rest/servicedeskapi/requesttype${serviceDeskQuery}${searchQuery}&limit=1000`,
        undefined,
        "GET",
        undefined,
        { experimental: true }
      )
    ).body;
  }

  static async deleteAll(serviceDeskIdsOrProjectKeys: string[]) {
    let requestTypePage = await RequestType.getAll(serviceDeskIdsOrProjectKeys);
    await Promise.all(
      requestTypePage.values
        ?.filter((requestType) => requestType.name !== "Emailed request")
        ?.map((requestType) => new RequestType(requestType.serviceDeskId).WithId(requestType.id).delete())
    );
    //@ts-ignore Service Desk Page Bean uses isLastPage instead of isLast
    if (!requestTypePage.isLastPage) {
      await RequestType.deleteAll(serviceDeskIdsOrProjectKeys);
    }
    return Promise.resolve();
  }
}

function requiredFieldMap(fields: FieldConfigurationItem[]) {
  return fields.map((field) => {
    return { ...field, isRequired: true };
  });
}
function unrequiredFieldMap(fields: FieldConfigurationItem[]) {
  return fields.map((field) => {
    return { ...field, isRequired: false };
  });
}
