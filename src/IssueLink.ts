import {IssueLinkType} from "./IssueLinkType";
import {JiraCrudType} from "./JiraCrudType";
import {Comment} from "./Comment";

export class IssueLink extends JiraCrudType {
  constructor() {
    super("/rest/api/3/issueLink");
  }

  create(requestBody: IssueLinkCreateRequest) {
    if (requestBody.type instanceof IssueLinkType) {
      requestBody.type = requestBody.type.body.name;
    }
    return super.create(requestBody);
  }
}

export interface IssueLinkCreateRequest {
  type: IssueLinkType | string;
  inwardIssue: string;
  outwardIssue: string;
  comment?: Comment;
}
