import {JiraApi} from "./JiraApi";
import {JiraCrudType} from "./JiraCrudType";

export interface IssueLinkTypeCreateRequest {
  name: string;
  inward: string;
  outward: string;
}

export interface IssueLinkTypeUpdateRequest {
  name?: string;
  inward?: string;
  outward?: string;
}

export interface IssueLinkTypeDetails {
  id: string;
  name: string;
  inward: string;
  outward: string;
  self: string;
}

export class IssueLinkType extends JiraCrudType<IssueLinkTypeDetails> {
  constructor() {
    super("/rest/api/3/issueLinkType");
  }
  async create(body: IssueLinkTypeCreateRequest) {
    await super.create(body);
    if (
      this?.error?.errorMessages?.some((m) => m.startsWith("You cannot create two issue link types with the same name"))
    ) {
      return await this.readByName(body.name);
    }
    return this;
  }
  async readByName(name: string) {
    let result = await IssueLinkType.readAll().then((types) => types.find((t) => t.name === name));
    if (result) this.body = result
    else console.error(`Could not find IssueLinkType with name ${name}.`)

    return this
  }

  update(body: IssueLinkTypeUpdateRequest) {
    return super.update(body);
  }

  static async readAll() {
    return (await JiraApi<{ issueLinkTypes: IssueLinkTypeDetails[] }>(`/rest/api/3/issueLinkType`)).body.issueLinkTypes;
  }
}
