import {JiraCrudType} from "./JiraCrudType";
import {JiraApi} from "./JiraApi";
import { PageBean } from "./CrudType";

export interface IssueTypeSchemeCreateRequest {
  name: string;
  issueTypeIds: Array<string | number>;
  description?: string;
  defaultIssueTypeId: string | number; //has to be in issueTypeIds
}

export interface IssueTypeSchemeDetails extends IssueTypeSchemeCreateRequest {
  id: string | number;
  issueTypeSchemeId?: string | number;
}

export class IssueTypeScheme extends JiraCrudType<IssueTypeSchemeDetails, IssueTypeSchemeCreateRequest> {
  constructor() {
    super(`/rest/api/3/issuetypescheme`);
  }
  static async getSchemesForProject(projectId: string | number) {
    return (await JiraApi(`/rest/api/3/issuetypescheme/project?projectId=${projectId}`)).body;
  }
  // static async getItems(){}
  // async removeIssueTypes(){}
  // async addIssueTypes(){}
  // async assignToProject(projectId:string){}
  async create(requestBody: IssueTypeSchemeCreateRequest) {
    let id = (await super.create(requestBody)).body.issueTypeSchemeId!;
    this._state.body = { ...requestBody, id };
    
    return this;
  }

  static async deleteAllUnused() {
    let getPage = async (startAt = 0) => {
      return JiraApi<PageBean<{id: number, projects:PageBean<{id: number}>}>>(
        `/rest/api/3/issuetypescheme?expand=projects&startAt=` + startAt
      ).then(({ body }) => body);
    };
    let page = await getPage();
    let unusedItems: {id: number, projects:PageBean<{id: number}>}[] = [];
    page.values.forEach((value) => value.projects.total || unusedItems.push(value));
    while (!page.isLast) {
      page = await getPage(page.startAt + page.maxResults);
      page.values.forEach((value) => value.projects.total || unusedItems.push(value));
    }
    return Promise.all(unusedItems.map((item) => new IssueTypeScheme().WithId(item.id).delete()));
  }
}
