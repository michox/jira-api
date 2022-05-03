import { PageBean } from "atlassian-request";
import { DefaultCustomFieldValue } from "./CustomFieldDefaultValue";
import { CustomFieldOption, createOrUpdateOptions } from "./CustomFieldOption";
import { AtlassianRequest } from "atlassian-request";
import { JiraCrudType } from "./JiraCrudType";

export declare type TypeAndSearcher =
  | { name: "cascadingselect"; abrSearcher: "cascadingselectsearcher" }
  | { name: "datepicker"; abrSearcher: "daterange" }
  | { name: "datetime"; abrSearcher: "datetimerange" }
  | { name: "float"; abrSearcher: "exactnumber" }
  | { name: "float"; abrSearcher: "numberrange" }
  | { name: "grouppicker"; abrSearcher: "grouppickersearcher" }
  | { name: "importid"; abrSearcher: "exactnumber" }
  | { name: "importid"; abrSearcher: "numberrange" }
  | { name: "labels"; abrSearcher: "labelsearcher" }
  | { name: "multicheckboxes"; abrSearcher: "multiselectsearcher" }
  | { name: "multigrouppicker"; abrSearcher: "grouppickersearcher" }
  | { name: "multiselect"; abrSearcher: "multiselectsearcher" }
  | { name: "multiuserpicker"; abrSearcher: "userpickergroupsearcher" }
  | { name: "multiversion"; abrSearcher: "versionsearcher" }
  | { name: "project"; abrSearcher: "projectsearcher" }
  | { name: "radiobuttons"; abrSearcher: "multiselectsearcher" }
  | { name: "readonlyfield"; abrSearcher: "textsearcher" }
  | { name: "select"; abrSearcher: "multiselectsearcher" }
  | { name: "textarea"; abrSearcher: "textsearcher" }
  | { name: "textfield"; abrSearcher: "textsearcher" }
  | { name: "url"; abrSearcher: "exacttextsearcher" }
  | { name: "userpicker"; abrSearcher: "userpickergroupsearcher" }
  | { name: "version"; abrSearcher: "versionsearcher" };

export interface CustomFieldCreateProps {
  name: string;
  description?: string;
  typeAndSearcher: TypeAndSearcher;
  options?: ({ value: string; oldValue: string } | string)[]; //use oldValue to update an options. Cascading values are not yet supported
  contextId?: string;
  defaultFieldValue?: DefaultCustomFieldValue;
}

export interface CustomFieldCreateRequest {
  name: string;
  description?: string;
  type?: string;
  searcherKey?: string;
  options?: string[];
}

export interface CustomFieldDetails {
  id: string;
  key?: string;
  name: string;
  custom: boolean;
  orderable: boolean;
  navigable: boolean;
  searchable: boolean;
  clauseNames: string[];
  description: string;
  // scope: Scope; //not sure where this was imported from but it does not appear on the default read or create requests
  schema: Schema;
}

export interface CustomFieldContext {
  id: string;
  name: string;
  description: string;
  isGlobalContext: boolean;
  isAnyIssueType: boolean;
}

interface CustomFieldSearch {
  id: string;
  name: string;
  schema: Schema;
  description: string;
  screensCount: number;
  isLocked: boolean;
}

interface Schema {
  type: string;
  items: string;
  system: string;
  custom: string;
  customId: number;
  configuration: AvatarUrls;
}

interface Scope {
  type: string;
  project: Project;
}

interface Project {
  self: string;
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
  simplified: boolean;
  avatarUrls: AvatarUrls;
  projectCategory: AvatarUrls;
}

interface AvatarUrls {}

export class CustomField extends JiraCrudType<CustomFieldDetails, CustomFieldCreateRequest> {
  constructor() {
    super("/rest/api/3/field");
  }

  async createOrUpdate(body: CustomFieldCreateProps) {
    if ((await this.readFieldByName(body.name, body.typeAndSearcher.name)).error) return this.create(body);
    else if (this.body.description.startsWith("Crewmaker")) return this.update(body);
    else return this.create(body);
  }

  async create(body: CustomFieldCreateProps | CustomFieldCreateRequest) {
    if (
      body.hasOwnProperty("typeAndSearcher") ||
      body.hasOwnProperty("options") ||
      body.hasOwnProperty("contextId") ||
      body.hasOwnProperty("defaultFieldValue")
    ) {
      let { requestBody, options, contextId, defaultFieldValue } = this.preprocessRequestBody(
        body as CustomFieldCreateProps
      );
      await super.create(requestBody as CustomFieldCreateRequest);

      if (options) {
        contextId = contextId || (await this.getDefaultContextId());
        let optionsObject = {
          options: options.map((option) =>
            typeof option === "string"
              ? Object({ value: option })
              : (Object({ value: option.value }) as { value: string })
          ),
        };
        await new CustomFieldOption(this.body.id, contextId!).create(optionsObject);
      }
      if (defaultFieldValue) {
        contextId = defaultFieldValue.contextId || contextId || (await this.getDefaultContextId());
        await this.setDefaultFieldValue(defaultFieldValue);
      }
    } else await super.create(body as CustomFieldCreateRequest);
    return this;
  }

  async update(body: Partial<CustomFieldCreateProps>) {
    let {
      requestBody: { type, ...rest },
      options,
      contextId,
      defaultFieldValue,
    } = this.preprocessRequestBody(body);
    await super.update(rest);

    if (options) {
      contextId = contextId || (await this.getDefaultContextId());
      await createOrUpdateOptions(options, this.body.id, contextId, this._defaultRestAddress);
    }

    if (defaultFieldValue) {
      contextId = defaultFieldValue.contextId || contextId || (await this.getDefaultContextId());
      await this.setDefaultFieldValue(defaultFieldValue);
    }
    return this;
  }

  async read() {
    let state = await AtlassianRequest<PageBean<CustomFieldDetails>>(`${this._defaultRestAddress}/search?id=${this.body.id}`);
    let body = state.body.values.find((v) => v.id === this.body.id) as CustomFieldDetails;
    if (body == undefined) {
      this.state.error = { errorMessages: [`field with name ${name} not found`] };
      this.state.status = "error";
      this.state.statusCode = 404;
      return this;
    }
    this.state = { ...state, body: body };
    return this;
  }

  async readFieldByName(name: string, type?: TypeAndSearcher["name"]) {
    let state = await AtlassianRequest<PageBean<CustomFieldDetails>>(
      this._defaultRestAddress + `/search?query=${name}&expand=lastUsed&orderBy=lastUsed`
    );
    let body = state.body.values.find(
      (v) => v.name.toLowerCase() === name.toLowerCase() && (type ? v.schema.custom.endsWith(type) : true)
    ) as CustomFieldDetails;
    if (body == undefined) {
      this.state.error = { errorMessages: [`field with name ${name} not found`] };
      this.state.status = "error";
      this.state.statusCode = 404;
      return this;
    }
    this.state = { ...state, body: body };
    return this;
  }

  private async getDefaultContextId(): Promise<string | undefined> {
    return await AtlassianRequest<PageBean<CustomFieldContext>>(this._defaultRestAddress + "/" + this.body.id + "/context").then(
      ({ body }) => body.values[0].id
    );
  }

  private async setDefaultFieldValue(defaultFieldValue: DefaultCustomFieldValue) {
    await AtlassianRequest(this._defaultRestAddress + `/${this.body.id}/context/defaultValue`, defaultFieldValue, "PUT");
  }

  static async deleteAllUnused() {
    let getPage = async (startAt = 0) => {
      return AtlassianRequest<PageBean<CustomFieldSearch>>(
        `/rest/api/3/field/search?expand=screensCount,isLocked&startAt=` + startAt
      ).then(({ body }) => body);
    };
    let page = await getPage();
    let unusedFields: CustomFieldSearch[] = [];
    while (!page.isLast) {
      page = await getPage(page.startAt + page.maxResults);
      page.values.forEach(
        (field: CustomFieldSearch) => field.screensCount || field.isLocked || unusedFields.push(field)
      );
    }
    return Promise.all(unusedFields.map((field) => new CustomField().WithId(field.id).delete()));
  }

  private preprocessRequestBody(body: Partial<CustomFieldCreateProps>) {
    let { typeAndSearcher, options, contextId, defaultFieldValue, ...restBody } = body;
    let type = typeAndSearcher && "com.atlassian.jira.plugin.system.customfieldtypes:" + typeAndSearcher.name;
    let searcherKey =
      typeAndSearcher && "com.atlassian.jira.plugin.system.customfieldtypes:" + typeAndSearcher.abrSearcher;
    let requestBody = { ...restBody, type, searcherKey };
    return { requestBody, options, contextId, defaultFieldValue };
  }
}
