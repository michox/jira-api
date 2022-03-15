import IssueLinkType from "./IssueLinkType";
import JiraType from "./JiraCrudType";
import Comment from "./Comment";

export default class IssueLink extends JiraType {
  constructor() {
    super("/rest/api/3/issueLink");
  }

  create(requestBody: IssueLinkTypeCreateRequest) {
    if (requestBody.type instanceof IssueLinkType) {
      requestBody.type = requestBody.type.body.name;
    }
    return super.create(requestBody);
  }
}

export interface IssueLinkTypeCreateRequest {
  type: IssueLinkType | string;
  inwardIssue: string;
  outwardIssue: string;
  comment?: Comment;
}
