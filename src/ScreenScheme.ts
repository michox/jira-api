import { JiraCrudType } from "./JiraCrudType";
import { JiraApi } from "./JiraApi";
import { PageBean } from "./CrudType";

export interface ScreenSchemeRequest {
  screens: {
    default: number | string;
    view?: number | string;
    edit?: number | string;
    create?: number | string;
  };
  name: string;
  description?: string;
}

export interface ScreenSchemeBody extends ScreenSchemeRequest {
  id?: number | string;
}

export class ScreenScheme extends JiraCrudType<ScreenSchemeBody, ScreenSchemeRequest> {
  constructor() {
    super(`/rest/api/3/screenscheme`);
  }

  async read(id = this.body.id) {
    let state = await JiraApi<PageBean<ScreenSchemeBody>>(`/rest/api/3/screenscheme?id=${id}`);
    this.state = { ...state, body: state.body.values[0] };
    return this;
  }
  static async deleteAllUnused() {
    let getPage = async (startAt = 0) => {
      return JiraApi<PageBean<{ id: number; issueTypeScreenSchemes: PageBean<{ id: number }> }>>(
        `/rest/api/3/screenscheme?expand=issueTypeScreenSchemes&startAt=` + startAt
      ).then(({ body }) => body);
    };
    let page = await getPage();
    let unusedItems: any[] = [];
    page.values.forEach((value) => value.issueTypeScreenSchemes.total || unusedItems.push(value));
    while (!page.isLast) {
      page = await getPage(page.startAt + page.maxResults);
      page.values.forEach((value) => value.issueTypeScreenSchemes.total || unusedItems.push(value));
    }
    return Promise.all(unusedItems.map((item) => new ScreenScheme().WithId(item.id).delete()));
  }
}
