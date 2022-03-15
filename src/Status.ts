import JiraApi from "./JiraApi";
import JiraCrudType from "./JiraCrudType";

export interface StatusDetails {
  self?: string;
  description?: string;
  iconUrl?: string;
  name: string;
  id: string|number;
  statusCategory?: StatusCategory;
}

interface StatusCategory {
  self: string;
  id: number;
  key: string;
  colorName: string;
  name: string;
}

export default class Status extends JiraCrudType<StatusDetails> {
  constructor() {
    super("/rest/api/3/status");
  }

//status must be associated with a workflow to be found
  read(nameOrId: string) {
    return super.read("/rest/api/3/status/" + nameOrId);
  }
  delete() {
    console.error("deleting statuses is not allowed");
    return Promise.resolve(this);
  }
  create() {
    console.error("creating statuses is not allowed");
    return Promise.resolve(this);
  }
  update() {
    console.error("updating statuses is not allowed");
    return Promise.resolve(this);
  }

  static readAll() {
    return JiraApi<Array<StatusDetails>>("/rest/api/3/status");
  }
}
