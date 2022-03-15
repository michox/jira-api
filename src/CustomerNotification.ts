import {JiraCrudType} from "./JiraCrudType";

interface CustomerNotificationRequest {
  configurationData: {
    content: { "en-US": string };
    excludeinitiator: boolean;
    lingoLogicalId: "cadd0135-06a1-41da-ad61-04870c1fddc8";
    projectid: number;
    recipients: Array<{ type: "all_customers" | "reporters" }>;
  };
  ruleEnabled: boolean;
  projectKey: string;
  notificationId: notificationId;
}

enum notificationId {
  "Request created" = 10,
  "Public comment added",
  "Public comment edited",
  "Request resolved",
  "Request reopened",
  "Participant added",
  "Organization added",
  "Approval required",
  "Customer-visible status changed",
}

export class CustomerNotification extends JiraCrudType<CustomerNotificationRequest> {
  constructor() {
    super("/rest/servicedesk/notifications/1/rule");
  }
  async update(props: CustomerNotificationRequest, updateAddress = this._defaultRestAddress) {
    return super.update(props, `${updateAddress}/${props.projectKey}/ruleset/${notificationId[props.notificationId]}`);
  }
  // don't use this method
  async create(props: CustomerNotificationRequest, updateAddress = "") {
    
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
