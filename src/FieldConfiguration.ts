import { PageBean } from "./CrudType";
import {JiraApi} from "./JiraApi";
import {JiraCrudType} from "./JiraCrudType";

export interface FieldConfigurationCreateRequest {
  name: string;
  description?: string;
  configuration?: FieldConfigurationItem[];
}

export interface FieldConfigurationDetails extends FieldConfigurationCreateRequest {
  id: number;
  isDefault: boolean;
}

export interface FieldConfigurationIssueTypeItem {
  fieldConfigurationSchemeId: string;
  issueTypeId: string;
  fieldConfigurationId: string;
}

export interface FieldConfigurationItem {
  description?: string;
  id: string;
  isHidden?: boolean;
  isRequired?: boolean;
  renderer?: string;
}

export class FieldConfiguration extends JiraCrudType<
  FieldConfigurationDetails,
  FieldConfigurationCreateRequest
> {
  constructor() {
    super("/rest/api/3/fieldconfiguration");
  }

  async create(body: FieldConfigurationCreateRequest) {
    let { configuration, ...createBody } = body;
    await super.create(createBody);
    if (this.error?.errorMessages[0]) await this.readByName(body.name)// assume that fieldconfiguration already exists
    configuration && (await this.updateFieldConfigurationItems(configuration));
    return this;
  }

  async updateFieldConfigurationItems(configuration: FieldConfigurationItem[]) {
    await JiraApi(
      `${this._defaultRestAddress}/${this.body.id}/fields`,
      { fieldConfigurationItems: configuration },
      "PUT"
    );
    return this;
  }

  async getFieldConfigurationItems() {
    if (!this.body.id) {
      
    }
    let getPage = async (startAt = 0) => {
      return JiraApi<PageBean<FieldConfigurationItem>>(
        `${this._defaultRestAddress}/${this.body.id}/fields?maxResults=1000&startAt=${startAt}`
      ).then((response) => response.body);
    };
    let values: FieldConfigurationItem[] = [];
    let page = await getPage();
    values = values.concat(page.values);
    while (!page.isLast) {
      page = await getPage(page?.startAt + page?.maxResults);
      values = values.concat(page.values);
    }
    return values;
  }

  read(address = `${this._defaultRestAddress}?id=${this.body.id}`) {
    return super.read(address);
  }

  async getMapping() {
    return JiraApi(`/rest/api/3/fieldconfigurationscheme/mapping`);
  }

  static async deleteAllUnused() {
    let getPage = async (startAt = 0) => {
      return JiraApi<PageBean<{ id: number }>>(`/rest/api/3/fieldconfiguration?startAt=` + startAt).then(
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
    
    return Promise.all(unusedItems.map((item) => new FieldConfiguration().WithId(item.id).delete()));
  }
}
