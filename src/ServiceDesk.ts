import { JiraCrudType } from "./JiraCrudType";

export interface ServiceDeskDetails {
  id: string;
  projectId: string;
  projectName: string;
  projectKey: string;
  _links: Links;
}

interface Links {
  self: string;
}

export class ServiceDesk extends JiraCrudType<ServiceDeskDetails> {
  constructor() {
    super("/rest/servicedeskapi/servicedesk");
  }
  read(idOrProjectKeyOrId: string = this.body.id) {
    this.WithId(idOrProjectKeyOrId);
    return super.read();
  }
  delete() {
    console.error("deleting ServiceDesks is not allowed");
    return Promise.resolve(this);
  }
  create() {
    console.error("creating ServiceDesks is not allowed");
    return Promise.resolve(this);
  }
  update() {
    console.error("updating ServiceDesks is not allowed");
    return Promise.resolve(this);
  }
}
