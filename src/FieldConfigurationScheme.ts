import { PageBean } from "./CrudType";
import { JiraApi } from "./JiraApi";
import { JiraCrudType } from "./JiraCrudType";

export interface FieldConfigurationSchemeCreateRequest {
  name: string;
  description?: string;
  projectId?: string | number;
  mapping?: FieldConfigurationSchemeMapping[];
}

export interface FieldConfigurationSchemeDetails {
  id: string | number;
  name: string;
  description: string;
  mapping?: FieldConfigurationSchemeMapping[];
}

export interface FieldConfigurationSchemeMapping {
  issueTypeId: string | number;
  fieldConfigurationId: string | number;
}

export class FieldConfigurationScheme extends JiraCrudType<
  FieldConfigurationSchemeDetails,
  FieldConfigurationSchemeCreateRequest
> {
  constructor() {
    super("/rest/api/3/fieldconfigurationscheme");
  }
  async read() {
    if (!this?.body?.id) {
    }
    let state = await JiraApi<PageBean<FieldConfigurationSchemeDetails>>(
      this._defaultRestAddress + "?id=" + this.body.id
    );
    this.setState({ ...state, body: state.body.values[0] });
    return this;
  }

  async readByProject(projectId: string) {
    let state = await JiraApi<
      PageBean<{ projectIds: string[]; fieldConfigurationScheme: FieldConfigurationSchemeDetails }>
    >(this._defaultRestAddress + `/project?projectId=` + projectId);
    this.setState({ ...state, body: state.body.values[0]?.fieldConfigurationScheme });
    return this;
  }
  async create(body: FieldConfigurationSchemeCreateRequest) {
    console.log("creating field configuration scheme with name", body.name);
    await super.create({ name: body.name, description: body.description });
    body.projectId && (await this.assignToProject(body.projectId));
    body.mapping && (await this.setMapping(body.mapping));
    console.log(this.body.name);
    return this;
  }

  async assignToProject(projectId: string | number) {
    await JiraApi(
      this._defaultRestAddress + "/project",
      { fieldConfigurationSchemeId: this.body.id, projectId },
      "PUT"
    );
  }

  async getMapping() {
    if (!this.body.id) {
      console.error("Field Configuration Scheme ID has not yet been defined.");
    }
    this.body.mapping = (
      await JiraApi<PageBean<FieldConfigurationSchemeMapping & { fieldConfigurationSchemeId: string }>>(
        this._defaultRestAddress + "/mapping?maxResults=1000&fieldConfigurationSchemeId=" + this.body.id
      )
    ).body.values.map((item) => {
      if (this.body.id != item.fieldConfigurationSchemeId) {
        console.error("unexpected configuration scheme id.");
      }
      return { issueTypeId: item.issueTypeId, fieldConfigurationId: item.fieldConfigurationId };
    });
    return this.body.mapping;
  }

  async setMapping(mapping: FieldConfigurationSchemeMapping[]) {
    this.body.mapping = mapping;
    (
      await JiraApi<PageBean<FieldConfigurationSchemeMapping>>(
        this._defaultRestAddress + "/" + this.body.id + "/mapping",
        { mappings: mapping },
        "PUT"
      )
    ).body.values;
  }

  async getFieldConfigurationIdForIssueType(issueTypeId: string) {
    console.log("getFieldConfigurationIdForIssueType: ", issueTypeId);

    let items = await this.getMapping();
    let item =
      items.find((item) => item.issueTypeId === issueTypeId) || items.find((item) => item.issueTypeId === "default")!;
    return item.fieldConfigurationId;
  }
  static async deleteAllUnused() {
    let getPage = async (startAt = 0) => {
      return JiraApi<PageBean<{ id: number }>>(`/rest/api/3/fieldconfigurationscheme?startAt=` + startAt).then(
        ({ body }) => body
      );
    };
    let page = await getPage();
    let unusedItems: any[] = [];
    page.values.forEach((value) => unusedItems.push(value));
    while (!page.isLast) {
      page = await getPage(page.startAt + page.maxResults);
      page.values.forEach((value) => unusedItems.push(value));
    }

    return Promise.all(unusedItems.map((item) => new FieldConfigurationScheme().WithId(item.id).delete()));
  }
}
