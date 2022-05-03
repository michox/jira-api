import { DocNode } from "@atlaskit/adf-utils/dist/types/validator/entry";
import { encodeObject, AtlassianRequest } from "atlassian-request";
import { JiraCrudType } from "./JiraCrudType";

export class Issue extends JiraCrudType<IssueBean, IssueCreateRequest> {
  constructor() {
    super("/rest/api/3/issue");
  }

  async transition(props: TransitionRequest) {
    await AtlassianRequest(`${this._defaultRestAddress}/${this.body.id}/transitions`, props, "POST");
  }
  async sendNotification(props: NotificationRequest) {
    await AtlassianRequest(`${this._defaultRestAddress}/${this.body.id}/notify`, props, "POST");
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
    return Promise.all(this.body?.fields?.attachment.map((attachment) => AtlassianRequest(attachment.content)));
  }

  async getFields(field: string | string[]) {
    let response = await AtlassianRequest<IssueBean>(`${this._defaultRestAddress}/${this.body.id}?fields=-*all,${field}`);
    this.state = { ...response, body: { ...this.body, fields: response.body.fields } };
    return this;
  }

  async getProperty(propertyKey: string) {
    let response = await AtlassianRequest<IssueProperty>(
      `${this._defaultRestAddress}/${this.body.id}/properties/${propertyKey}`
    );
    this.state = { ...response, body: { ...this.body, properties: { ...this.body.properties, [propertyKey]: response.body.value } } };
    return this;
  }
  async getAllPropertyKeys() {
    let response = await AtlassianRequest<IssuePropertyKeys>(`${this._defaultRestAddress}/${this.body.id}/properties/`);
    this.state = {
      ...response,
      body: {
        ...this.body,
        properties: Object.fromEntries(response.body.keys.map((prop) => [prop.key.value, undefined])),
      },
    };
    return this;
  }
  async getAllProperties() {
    await this.getAllPropertyKeys();
    await Promise.all(Object.keys(this.body.properties).map(propertyKey=>this.getProperty(propertyKey)))

    return this;
  }

  async setProperty(propertyKey: string, value: any) {
    let response = await AtlassianRequest(`${this._defaultRestAddress}/${this.body.id}/properties/${propertyKey}`, value, "PUT");
    this.state = { ...response, body: { ...this.body, properties: { ...this.body.properties, [propertyKey]: value } } };
    return this;
  }

  async assign(accountId: string | null | -1 = null) {
    let response = await AtlassianRequest(`${this._defaultRestAddress}/${this.body.id}/assignee`, { accountId }, "PUT");
    this.state = { ...response, body: { ...this.body } };
    return this;
  }

  async cloneIssue(issue: IssueBean) {
    //strip id and other not supported fields
    //if id map is defined, replace issue constants with new ids
    //iterate over activities
    //if activity is comment or transition, do that
    //upload attachments
    //clone sub-issues
    //
    return this;
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
  notifyUsers?: boolean; //Whether a notification email about the issue update is sent to all watchers. Status disable the notification, administer Jira or administer project permissions are required. If the user doesn't have the necessary permission the request is ignored.
  //Default: false
  overrideScreenSecurity?: boolean; //Whether screen security is overridden to enable hidden fields to be edited. Available to Connect app users with admin permission and Forge app users with the manage:jira-configuration scope.
  //Default: false
  overrideEditableFlag?: boolean; //Whether screen security is overridden to enable uneditable fields to be edited. Available to Connect app users with admin permission and Forge app users with the manage:jira-configuration scope.
}

export interface Fields {
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

export interface IssueBean {
  expand: string;
  id: string;
  self: string;
  key: string;
  renderedFields: RenderedFields;
  properties: { [field: string]: any };
  names: Names;
  schema: Schema;
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
  author: User;
  created: string;
  items: Item[];
  historyMetadata: HistoryMetadata;
}

interface Operations {
  linkGroups: LinkGroup[];
}

interface LinkGroup {
  id: string;
  styleClass?: string;
  header?: { [field: string]: any };
  weight: number;
  links: Link[];
  groups: Group[];
}

interface Transition {
  id: string;
  name: string;
  to: Status;
  hasScreen: boolean;
  isGlobal: boolean;
  isInitial: boolean;
  isAvailable: boolean;
  isConditional: boolean;
  fields: { [field: string]: any };
  expand: string;
  looped: boolean;
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

interface Group {
  name: string;
}

export interface Fields {
  summary: string;
  project: Project;
  status?: Status;
  watcher?: WatcherField;
  attachment?: Attachment[];
  "sub-tasks"?: Subtask[];
  description?: DocNode;
  issuetype: { id: string | number };
  reporter?: User;
  assignee?: User;
  components?: { id: string | number }[];
  priority?: { id: string | number };
  comment?: Comment[];
  issuelinks?: Issuelink[];
  worklog?: Worklog[];
  updated?: number;
  timetracking?: Timetracking;
  versionedRepresentations?: VersionedRepresentations;
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
  author: User;
  updateAuthor: User;
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
  author: User;
  body: DocNode;
  updateAuthor: User;
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
  author: User;
  created: string;
  size: number;
  mimeType: string;
  content: string;
  thumbnail: string;
  mediaApiFileId: string;
}

interface User {
  self: string;
  key: string;
  accountId: string;
  accountType?: string;
  name: string;
  avatarUrls: AvatarUrls;
  displayName: string;
  active?: boolean;
  emailAddress?: string;
  timeZone?: string;
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

interface Schema {
  assignee: User;
  status: Status;
}

interface Names {
  assignee: string;
  status: string;
}

interface VersionedRepresentations {
  assignee: Version<User>;
  status: Version<Status>;
}

interface Version<type = any> {
  [version: string]: type;
}

interface Changelog {
  startAt: number;
  maxResults: number;
  total: number;
  histories: History[];
}

interface History {
  id: string;
  author: User;
  created: string;
  items: Item[];
}

interface Item {
  field: string;
  fieldtype: string;
  fieldId?: string;
  from?: any;
  fromString?: any;
  to: string;
  toString: string;
  tmpFromAccountId?: any;
  tmpToAccountId?: string;
}

interface AvatarUrls {
  "48x48": string;
  "24x24": string;
  "16x16": string;
  "32x32": string;
}

interface Editmeta {
  fields: Fields;
}

interface Header {
  id: string;
  styleClass?: string;
  iconClass?: string;
  label: string;
  title?: string;
}

interface Group {
  id: string;
  weight?: number;
  links: Link[];
  groups: Group[];
}

interface Link {
  id: string;
  styleClass?: string;
  iconClass?: string;
  label: string;
  title?: string;
  href: string;
  weight?: number;
}

interface Transition {
  id: string;
  name: string;
  to: Status;
  hasScreen: boolean;
  isGlobal: boolean;
  isInitial: boolean;
  isAvailable: boolean;
  isConditional: boolean;
  isLooped: boolean;
}

interface Status {
  self?: string;
  description?: string;
  iconUrl?: string;
  name: string;
  id: string;
  statusCategory?: StatusCategory;
}

interface StatusCategory {
  self: string;
  id: number;
  key: string;
  colorName: string;
  name: string;
}

interface RenderedFields {
  assignee?: any;
  status?: any;
}

interface IssuePropertyKeys {
  keys: Key[];
}

interface Key {
  self: Value;
  key: Value;
}

interface Value {
  value: string;
}

interface IssueProperty {
  key: string;
  value: Value;
}

interface Value {}
