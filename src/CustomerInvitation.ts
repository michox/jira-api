import {JiraCrudType} from "./JiraCrudType";

export interface CustomerInvitationRequest {
  projectKey: string;
  accountNotificationEnabled: boolean;
  contentConfig: string;
  subjectConfig: string;
}

export class CustomerInvitation extends JiraCrudType<CustomerInvitationRequest> {
  constructor() {
    super("/rest/servicedesk/notifications/1/account-notifications");
  }
  async update(props: CustomerInvitationRequest, updateAddress = this._defaultRestAddress) {
    return super.update(props, `${updateAddress}/${props.projectKey}/notification/invite-customer`);
  }
  // don't use this method
  async create(props: CustomerInvitationRequest, updateAddress = "") {
    
    return this;
  }
  // don't use this method
  async delete(updateAddress = "") {
    
    return this;
  }
  // don't use this method
  async read(updateAddress = "") {
    
    return this;
  }
}
