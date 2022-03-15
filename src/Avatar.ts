import { JiraApi } from "./JiraApi";
import { JiraCrudType } from "./JiraCrudType";
// import fs from "fs";
//todo implement hook compatibility and follow proposed pattern of CrudType
export class Avatar extends JiraCrudType {
  constructor(
    readonly type: "project" | "issuetype",
    readonly ownerId: string,
    readonly size: number, //will turn into a square of this size and then create 4 sizes of avatars
    readonly filePath: string //local path to your file
  ) {
    super(`universal_avatar/type/${type}/owner/${ownerId}`);
  }

  load = async () => {
    // let filestream = fs.createReadStream(this.filePath);
    let response = await JiraApi(
      `/rest/api/3/universal_avatar/type/${this.type}/owner/${this.ownerId}/?size=${this.size}`,
      { file: this.filePath },
      "POST",
      {
        "X-Atlassian-Token": "no-check",
        "Content-Type": "image/image png",
      },
      { binaryAttachment: true }
    );
  };
  delete = async (
    destination = `/rest/atlassian-connect/1/universal_avatar/type/${this.type}/owner/${this.ownerId}/${this.body.id}`
  ) => {
    this.state = await JiraApi(destination, {}, "DELETE");
    return this;
  };
}
