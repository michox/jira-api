
import { DocNode } from "@atlaskit/adf-utils/dist/types/validator/entry";
import {JiraApi, encodeObject}  from "./JiraApi";
import {JiraCrudType} from "./JiraCrudType";

export class Issue extends JiraCrudType<IssueBean, IssueCreateRequest> {
  constructor() {
    super("/rest/api/3/issue");
  }

  async transition(props: TransitionRequest) {
    await JiraApi(`${this._defaultRestAddress}/${this.body.id}/transitions`, props, "POST");
  }
  async sendNotification(props: NotificationRequest) {
    await JiraApi(`${this._defaultRestAddress}/${this.body.id}/notify`, props, "POST");
  }
  async update(data?: IssueEditRequest): Promise<this> {
    return super.update(data?.body, `${this._defaultRestAddress}/${this.body.id}?${encodeObject(data?.param)}`);
  }
  async getAttachments() {
    if (!this.body?.fields?.attachment?.length) {
      this.read();
    }
    if (!this.body?.fields?.attachment?.length) {
      return Promise.resolve(undefined);
    }
    return Promise.all(this.body?.fields?.attachment.map((attachment) => JiraApi(attachment.content)));
  }
}

interface IssueCreateRequest {
  fields?: Fields;
  update?: Fields;
  transition?: Transition;
  historyMetadata?: HistoryMetadata;
  properties?: [{ key: string; value: any }];
}

interface TransitionRequest extends IssueCreateRequest {
  transition: Transition;
}

interface Transition {
  id: string;
  looped: boolean;
}

interface IssueEditRequest {
  body: IssueCreateRequest;
  param: IssueEditParam;
}

interface IssueEditParam {
  //Default: true
  notifyUsers?: boolean; //Whether a notification email about the issue update is sent to all watchers. To disable the notification, administer Jira or administer project permissions are required. If the user doesn't have the necessary permission the request is ignored.
  //Default: false
  overrideScreenSecurity?: boolean; //Whether screen security is overridden to enable hidden fields to be edited. Available to Connect app users with admin permission and Forge app users with the manage:jira-configuration scope.
  //Default: false
  overrideEditableFlag?: boolean; //Whether screen security is overridden to enable uneditable fields to be edited. Available to Connect app users with admin permission and Forge app users with the manage:jira-configuration scope.
}

interface Fields {
  [fieldName: string]: any;
}

interface HistoryMetadata {
  type: string;
  description: string;
  descriptionKey: string;
  activityDescription: string;
  activityDescriptionKey: string;
  emailDescription: string;
  emailDescriptionKey: string;
  actor: HistoryMetadataParticipant;
  generator: HistoryMetadataParticipant;
  cause: HistoryMetadataParticipant;
  extraData: Object;
}

interface HistoryMetadataParticipant {
  id: string;
  displayName: string;
  displayNameKey: string;
  type: string;
  avatarUrl: string;
  url: string;
}

interface IssueBean {
  expand: string;
  id: string;
  self: string;
  key: string;
  renderedFields: RenderedFields;
  properties: { [field: string]: any };
  names: { [field: string]: any };
  schema: { [field: string]: any };
  transitions: Transition[];
  operations: Operations;
  editmeta: Editmeta;
  changelog: Changelog;
  versionedRepresentations: { [field: string]: any };
  fieldsToInclude: FieldsToInclude;
  fields: Fields;
}

interface FieldsToInclude {
  excluded: string[];
  included: string[];
  actuallyIncluded: string[];
}

interface Changelog {
  startAt: number;
  maxResults: number;
  total: number;
  histories: History[];
}

interface History {
  id: string;
  author: { [field: string]: any };
  created: string;
  items: { [field: string]: any }[];
  historyMetadata: { [field: string]: any };
}

interface Editmeta {
  fields: { [field: string]: any };
}

interface Operations {
  linkGroups: LinkGroup[];
}

interface LinkGroup {
  id: string;
  styleClass: string;
  header: { [field: string]: any };
  weight: number;
  links: { [field: string]: any }[];
  groups: any[];
}

interface Transition {
  id: string;
  name: string;
  to: To;
  hasScreen: boolean;
  isGlobal: boolean;
  isInitial: boolean;
  isAvailable: boolean;
  isConditional: boolean;
  fields: { [field: string]: any };
  expand: string;
  looped: boolean;
}

interface To {
  self: string;
  description: string;
  iconUrl: string;
  name: string;
  id: string;
  statusCategory: { [field: string]: any };
}

interface RenderedFields {
  [field: string]: any;
}

interface NotificationRequest {
  htmlBody?: string;
  subject?: string;
  textBody: string;
  to: Recipients;
  restrict: Restrictions;
}

interface Restrictions {
  permissions: (PermissionId | PermissionKey)[];
  groups: Group[];
}

interface PermissionId {
  id: string;
}
interface PermissionKey {
  key: string;
}

interface Recipients {
  voters: boolean;
  watchers: boolean;
  groups: Group[];
  reporter: boolean;
  assignee: boolean;
  users: User[];
}

interface User {
  accountId: string;
  active?: boolean;
}

interface Group {
  name: string;
}

interface Fields {
  summary: string;
  project: Project;
  status?: Status;
  watcher?: WatcherField;
  attachment?: Attachment[];
  "sub-tasks"?: Subtask[];
  description?: DocNode;
  issuetype: { id: string | number };
  reporter?: { id: string | number };
  assignee?: { id: string | number };
  components?: { id: string | number }[];
  priority?: { id: string | number };
  comment?: Comment[];
  issuelinks?: Issuelink[];
  worklog?: Worklog[];
  updated?: number;
  timetracking?: Timetracking;
}

interface Timetracking {
  originalEstimate: string;
  remainingEstimate: string;
  timeSpent: string;
  originalEstimateSeconds: number;
  remainingEstimateSeconds: number;
  timeSpentSeconds: number;
}

interface Worklog {
  self: string;
  author: Watcher;
  updateAuthor: Watcher;
  comment: DocNode;
  updated: string;
  visibility: Visibility;
  started: string;
  timeSpent: string;
  timeSpentSeconds: number;
  id: string;
  issueId: string;
}

interface Issuelink {
  id: string;
  type: Type;
  outwardIssue?: OutwardIssue;
  inwardIssue?: OutwardIssue;
}

interface Comment {
  self: string;
  id: string;
  author: Watcher;
  body: DocNode;
  updateAuthor: Watcher;
  created: string;
  updated: string;
  visibility: Visibility;
}

interface Visibility {
  type: string;
  value: string;
}
//when creating either key or ID is required
interface Project {
  id?: string;
  self?: string;
  key?: string;
  name?: string;
  avatarUrls?: AvatarUrls;
  projectCategory?: ProjectCategory;
  simplified?: boolean;
  style?: string;
  insight?: Insight;
}

interface Insight {
  totalIssueCount: number;
  lastIssueUpdateTime: string;
}

interface ProjectCategory {
  self: string;
  id: string;
  name: string;
  description: string;
}

interface Subtask {
  id: string;
  type: Type;
  outwardIssue: OutwardIssue;
}

interface OutwardIssue {
  id: string;
  key: string;
  self: string;
  fields: Fields;
}

interface Status {
  iconUrl: string;
  name: string;
}

interface Type {
  id: string;
  name: string;
  inward: string;
  outward: string;
}

interface Attachment {
  id: number;
  self: string;
  filename: string;
  author: Author;
  created: string;
  size: number;
  mimeType: string;
  content: string;
  thumbnail: string;
  mediaApiFileId: string;
}

interface Author {
  self: string;
  key: string;
  accountId: string;
  accountType: string;
  name: string;
  avatarUrls: AvatarUrls;
  displayName: string;
  active: boolean;
}

interface AvatarUrls {
  "48x48": string;
  "24x24": string;
  "16x16": string;
  "32x32": string;
}

interface WatcherField {
  self: string;
  isWatching: boolean;
  watchCount: number;
  watchers: Watcher[];
}

interface Watcher {
  self: string;
  accountId: string;
  displayName: string;
  active: boolean;
}
