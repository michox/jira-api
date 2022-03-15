import JiraType from "./JiraCrudType";
import JiraApi from "./JiraApi";
import { PageBean } from "./CrudType";
import IssueTypeScheme from "./IssueTypeScheme";

export interface IssueTypeScreenSchemeDetails {
  id: string | number;
  name: string;
  description?: string;
  issueTypeMappings: IssueTypeMapping[];
}

export interface IssueTypeScreenSchemeRequest {
  name: string;
  description?: string;
  issueTypeMappings: IssueTypeMapping[]; //must have at least one entry for default
}

export interface IssueTypeMapping {
  issueTypeId: string|number;
  screenSchemeId: string|number;
}

export interface IssueTypeScreenSchemeItem extends IssueTypeMapping {
  issueTypeScreenSchemeId: string;
}

export default class IssueTypeScreenScheme extends JiraType<IssueTypeScreenSchemeDetails, IssueTypeScreenSchemeRequest> {
  constructor() {
    super(`/rest/api/3/issuetypescreenscheme`);
  }

  async create(body:IssueTypeScreenSchemeRequest){    
    await super.create(body);
    this.body = {...this.body, ...body}
    return this
  }

  async read() {
    let state = await JiraApi(`/rest/api/3/issuetypescreenscheme?id=${this.body.id}`);
    this._state = { ...state, body: state.body.values[0] }; //return is a page bean but we specified an id so the first value will definitely be the item we are looking for
    this.body.issueTypeMappings = (await IssueTypeScreenScheme.getMapping([+this.body.id])).values.map(
      ({ issueTypeScreenSchemeId, ...rest }) => {
        return { ...rest };
      }
    );
    return this;
  }

  static async deleteAllUnused() {
    let getPage = async (startAt = 0) => {
      return JiraApi<PageBean<{id: number, projects:PageBean<{id: number}>}>>(
        `/rest/api/3/issuetypescreenscheme?expand=projects&startAt=` + startAt
      ).then(({ body }) => body);
    };
    let page = await getPage();
    let unusedItems: any[] = [];
    page.values.forEach((value) => value.projects.total  || unusedItems.push(value));
    while (!page.isLast) {
      page = await getPage(page.startAt + page.maxResults);
      page.values.forEach((value) => value.projects.total  || unusedItems.push(value));
    }
    
    return Promise.all(unusedItems.map((item) => new IssueTypeScreenScheme().WithId(item.id).delete()));
  }

  static async getMapping(issueTypeScreenSchemeIds: number[]): Promise<PageBean<IssueTypeScreenSchemeItem>> {
    let query = "?";
    issueTypeScreenSchemeIds.forEach((id) => (query += `issueTypeScreenSchemeId=${id}&`));
    query = query.slice(0, query.length - 1);
    return (await JiraApi(`/rest/api/3/issuetypescreenscheme/mapping${query}`)).body;
  }

}
