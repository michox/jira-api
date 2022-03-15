import {JiraCrudType} from "./JiraCrudType";

export interface CreateCommentRequest {
  body: any;
  visibility?: { type: "group" | "role"; value: string };
  properties?: { key: string; value: any }[];
}

export class Comment extends JiraCrudType {
  constructor(issueIdOrKey: string) {
    super(`/rest/api/3/issue/${issueIdOrKey}/comment`);
  }
  create(props: CreateCommentRequest) {
    return super.create(props);
  }
}
