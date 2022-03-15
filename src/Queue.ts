import {JiraCrudType} from "./JiraCrudType";
import {JiraApi} from "./JiraApi";

export interface QueueCreateRequest {
  name: string;
  columns: string[];
  canBeHidden: boolean;
  jql: string;
}

export interface QueueDetails extends QueueCreateRequest {
  projectKey: string;
  id:string
}

export class Queue extends JiraCrudType<QueueDetails, QueueCreateRequest> {
  constructor(projectKey: string) {
    super(`/rest/servicedesk/1/servicedesk/${projectKey}/queues`);
    this.body.projectKey = projectKey;
  }

  delete() {
    console.error("deleting queues is not allowed");
    return Promise.resolve(this);
  }
  create() {
    console.error("creating queues is not allowed");
    return Promise.resolve(this);
  }
  update() {
    console.error("updating queues is not allowed");
    return Promise.resolve(this);
  }
  // async create(body: QueueCreateRequest): Promise<this> {
  //   return super.create(body, `/rest/servicedesk/1/servicedesk/REC/queues`);
  // }
  
  // async delete(deleteAddress: string = `/rest/servicedesk/1/servicedesk/REC/queues`): Promise<this> {
  //   this.state = await JiraApi(deleteAddress, { deleted: [this.body.id] }, "PUT");
  //   return this;
  // }
}
