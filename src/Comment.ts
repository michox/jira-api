import JiraType from "./JiraCrudType";

interface CreateCommentRequest {
  body: any;
  visibility?: { type: "group" | "role"; value: string };
  properties?: { key: string; value: any }[];
}

export default class Comment extends JiraType {
  constructor(issueIdOrKey: string) {
    super(`/rest/api/3/issue/${issueIdOrKey}/comment`);
  }
  create(props: CreateCommentRequest) {
    return super.create(props);
  }
}
