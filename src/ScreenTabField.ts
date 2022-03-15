import JiraApi from "./JiraApi";
import JiraType from "./JiraCrudType";

interface ScreenTabFieldCreateRequest {
  fieldId: string | number;
}
export interface ScreenTabFieldDetails {
  id: string;
  name: string;
}

export class ScreenTabField extends JiraType<ScreenTabFieldDetails, ScreenTabFieldCreateRequest> {
  constructor(screenId: string | number, tabId: string | number) {
    super(`/rest/api/3/screens/${screenId}/tabs/${tabId}/fields`);
  }



  async move(arg: { after: string } | { position: "Earlier" | "Later" | "First" | "Last" }) {
    await JiraApi(this._defaultRestAddress + "/" + this.body.id + "/move", arg, "POST");
  }
}
