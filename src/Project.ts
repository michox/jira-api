import { JiraCrudType } from "./JiraCrudType";
import { AtlassianRequest } from "atlassian-request";
import { CrudState } from "atlassian-request";
import { WorkflowScheme, WorkflowSchemeDetails } from "./WorkflowScheme";
import { FieldConfigurationScheme, FieldConfigurationSchemeDetails } from "./FieldConfigurationScheme";

interface ProjectBaseCreateRequest {
  name: string;
  key: string;
  leadAccountId: string;
  description?: string;
  categoryId?: number | string;
  avatarId?: number | string;
  assigneeType: "PROJECT_LEAD" | "UNASSIGNED";
  notificationScheme?: number | string;
  permissionScheme?: number | string;
}

export interface ProjectTemplateCreateRequest extends ProjectBaseCreateRequest {
  projectTemplateKey?:
    | "com.pyxis.greenhopper.jira:gh-simplified-agility-kanban"
    | "com.pyxis.greenhopper.jira:gh-simplified-agility-scrum"
    | "com.pyxis.greenhopper.jira:gh-simplified-basic"
    | "com.pyxis.greenhopper.jira:gh-simplified-kanban-classic"
    | "com.pyxis.greenhopper.jira:gh-simplified-scrum-classic"
    | "com.atlassian.servicedesk:simplified-it-service-management"
    | "com.atlassian.servicedesk:simplified-general-service-desk"
    | "com.atlassian.servicedesk:simplified-internal-service-desk"
    | "com.atlassian.servicedesk:simplified-external-service-desk"
    | "com.atlassian.servicedesk:simplified-hr-service-desk"
    | "com.atlassian.servicedesk:simplified-facilities-service-desk"
    | "com.atlassian.servicedesk:simplified-legal-service-desk"
    | "com.atlassian.jira-core-project-templates:jira-core-simplified-content-management"
    | "com.atlassian.jira-core-project-templates:jira-core-simplified-document-approval"
    | "com.atlassian.jira-core-project-templates:jira-core-simplified-lead-tracking"
    | "com.atlassian.jira-core-project-templates:jira-core-simplified-process-control"
    | "com.atlassian.jira-core-project-templates:jira-core-simplified-procurement"
    | "com.atlassian.jira-core-project-templates:jira-core-simplified-project-management"
    | "com.atlassian.jira-core-project-templates:jira-core-simplified-recruitment"
    | "com.atlassian.jira-core-project-templates:jira-core-simplified-task-management"
    | "com.atlassian.jira-core-project-templates:jira-work-management-employee-onboarding"
    | "com.atlassian.jira-core-project-templates:jira-work-management-sales-pipeline"
    | "com.atlassian.jira-core-project-templates:jira-work-management-web-design-process"
    | "com.atlassian.jira-core-project-templates:jira-work-management-email-campaign-launch"
    | "com.atlassian.jira-core-project-templates:jira-work-management-personal-task-planner"
    | "com.atlassian.jira-core-project-templates:jira-work-management-go-to-market"
    | "com.atlassian.jira-core-project-templates:jira-work-management-campaign-management"
    | "com.atlassian.jira-core-project-templates:jira-work-management-event-planning"
    | "com.atlassian.jira-core-project-templates:jira-work-management-month-end-close"
    | "com.atlassian.jira-core-project-templates:jira-work-management-budget-creation"
    | "com.atlassian.jira-core-project-templates:jira-work-management-policy-management"
    | "com.atlassian.jira-core-project-templates:jira-work-management-asset-creation"
    | "com.atlassian.jira-core-project-templates:jira-work-management-performance-review"
    | "com.atlassian.jira-core-project-templates:jira-work-management-rfp-process"
    | "com.atlassian.jira-core-project-templates:jira-work-management-ip-infringement";
}

interface ProjectCustomCreateRequest extends ProjectBaseCreateRequest {
  projectTypeKey: "software" | "business" | "service_desk";
  issueSecurityScheme?: number | string;
  workflowScheme?: number | string;
  issueTypeScreenScheme?: number | string;
  issueTypeScheme?: number | string;
  fieldConfigurationScheme?: number | string;
}
export type ProjectCreateRequest = ProjectCustomCreateRequest | ProjectTemplateCreateRequest;

export interface ProjectDetails {
  expand: string;
  self: string;
  id: string;
  key: string;
  description: string;
  lead: Lead;
  components: Component[];
  issueTypes: IssueType[];
  url?: string;
  email?: string;
  assigneeType: string;
  versions: Version[];
  name: string;
  roles: Item;
  avatarUrls: AvatarUrls;
  projectCategory?: ProjectCategory;
  projectTypeKey: string;
  simplified: boolean;
  style: string;
  favourite?: boolean;
  isPrivate: boolean;
  issueTypeHierarchy?: IssueTypeHierarchy;
  permissions?: Permissions;
  properties: Item;
  uuid?: string;
  insight?: Insight;
  deleted?: boolean;
  retentionTillDate?: string;
  deletedDate?: string;
  deletedBy?: Lead;
  archived?: boolean;
  archivedDate?: string;
  archivedBy?: Lead;
  landingPageInfo?: LandingPageInfo;
  issueTypeScheme?: IssueTypeSchemeResponse;
  issueTypeScreenScheme?: IssueTypeScreenSchemeResponse;
  workflowScheme?: WorkflowSchemeDetails;
  fieldConfigurationScheme?: FieldConfigurationSchemeDetails;
}

interface LandingPageInfo {
  url: string;
  projectKey: string;
  projectType: string;
  boardId: number;
  simplified: boolean;
}

interface Insight {
  totalIssueCount: number;
  lastIssueUpdateTime: string;
}

interface Permissions {
  canEdit: boolean;
}

interface IssueTypeHierarchy {
  baseLevelId: number;
  levels: Level[];
}

interface Level {
  id: number;
  name: string;
  aboveLevelId: number;
  belowLevelId: number;
  projectConfigurationId: number;
  level: number;
  issueTypeIds: number[];
  externalUuid: string;
  globalHierarchyLevel: string;
}

interface ProjectCategory {
  self: string;
  id: string;
  name: string;
  description: string;
}

interface Version {
  expand: string;
  self: string;
  id: string;
  description: string;
  name: string;
  archived: boolean;
  released: boolean;
  startDate: string;
  releaseDate: string;
  overdue: boolean;
  userStartDate: string;
  userReleaseDate: string;
  project: string;
  projectId: number;
  moveUnfixedIssuesTo: string;
  operations: Operation[];
  issuesStatusForFixVersion: IssuesStatusForFixVersion;
}

interface IssuesStatusForFixVersion {
  unmapped: number;
  toDo: number;
  inProgress: number;
  done: number;
}

interface Operation {
  id: string;
  styleClass: string;
  iconClass: string;
  label: string;
  title: string;
  href: string;
  weight: number;
}

interface IssueType {
  self: string;
  id: string;
  description: string;
  iconUrl: string;
  name: string;
  subtask: boolean;
  avatarId: number;
  entityId: string;
  hierarchyLevel: number;
  scope: Scope;
}

interface Scope {
  type: string;
  project: Item;
}

interface Component {
  self: string;
  id: string;
  name: string;
  description: string;
  lead: Lead;
  leadUserName: string;
  assigneeType: string;
  assignee: Lead;
  realAssigneeType: string;
  realAssignee: Lead;
  isAssigneeTypeValid: boolean;
  project: string;
  projectId: number;
}

interface Lead {
  self: string;
  key: string;
  accountId: string;
  accountType: string;
  name: string;
  emailAddress: string;
  avatarUrls: AvatarUrls;
  displayName: string;
  active: boolean;
  timeZone: string;
  locale: string;
  groups: Groups;
  applicationRoles: Groups;
  expand: string;
}

interface Groups {
  size: number;
  items: Item[];
  pagingCallback: Item;
  callback: Item;
  "max-results": number;
}

interface Item {}

interface AvatarUrls {
  "16x16": string;
  "24x24": string;
  "32x32": string;
  "48x48": string;
}
interface IssueTypeSchemeResponse {
  id: string;
  name: string;
  defaultIssueTypeId: string;
}

interface IssueTypeScreenSchemeResponse {
  id: string;
  name: string;
  description: string;
}

export class Project extends JiraCrudType<ProjectDetails, ProjectCreateRequest> {
  constructor() {
    super("/rest/api/3/project");
  }
  //@todo:error-handling validate project keys and names
  async create(body: ProjectCustomCreateRequest | ProjectTemplateCreateRequest) {
    return await super.create(body);
  }

  archive = async () => {
    return AtlassianRequest(`${this._defaultRestAddress}/${this.body.id}/archive`, {}, "POST");
  };

  setEmail = async (emailAddress: string) => {
    return AtlassianRequest(`${this._defaultRestAddress}/${this.body.id}/email`, { emailAddress: emailAddress }, "PUT");
  };

  setAvatar = async (avatarId: number) => {
    return AtlassianRequest(`${this._defaultRestAddress}/${this.body.id}/avatar`, { id: avatarId }, "PUT");
  };

  loadAvatar = async (avatarFilePath: string) => {
    return AtlassianRequest(
      `${this._defaultRestAddress}/${this.body.id}/avatar2`,
      avatarFilePath,
      "POST",
      { "X-Atlassian-Token": "no-check", "Content-Type": "image/image png" },
      { binaryAttachment: true }
    );
  };

  /**
   *
   * @param key the key to check
   * @returns the original key if it is valid, otherwise a new valid key usually by adding a sequence number. Undefined if no key could be generated
   */
  static async validKey(key: string): Promise<string> {
    return (await AtlassianRequest(`/rest/api/3/projectvalidate/validProjectKey?key=${key}`)).body;
  }
  /**
   *
   * @param name the name to check
   * @returns the original name if it is valid, otherwise a new valid name usually by adding a sequence number. Undefined if no name could be generated
   */
  static async validName(name: string): Promise<string> {
    return (await AtlassianRequest(`/rest/api/3/projectvalidate/validProjectName?name=${name}`)).body;
  }

  // readProperty = async (propertykey: string) => {
  //   AtlassianRequest(`${this._defaultRestAddress}/${this.body.id}/${propertykey}`).then((requestState: CrudState) => {
  //     this._state.body[propertykey] = requestState.body;
  //   });
  // };

  readIssueTypeScreenSchemes = async () => {
    return AtlassianRequest(`/rest/api/3/issuetypescreenscheme/project?projectId=${this.body.id}`).then(
      (requestState: CrudState) => {
        this._state.body.issueTypeScreenScheme = requestState.body.values[0]
          .issueTypeScreenScheme as IssueTypeScreenSchemeResponse;
        return this;
      }
    );
  };

  readIssueTypeSchemes = async () => {
    return AtlassianRequest(`/rest/api/3/issuetypescheme/project?projectId=${this.body.id}`).then((requestState: CrudState) => {
      this._state.body.issueTypeScheme = requestState.body.values[0].issueTypeScheme as IssueTypeSchemeResponse;
      return this;
    });
  };

  readWorkflowSchemes = async () => {
    return WorkflowScheme.readAllWorkflowSchemes([+this.body.id]).then(({ values }) => {
      this._state.body.workflowScheme = values[0].workflowScheme;
    });
  };

  readFieldConfigurationScheme = async () => {
    return new FieldConfigurationScheme().readByProject(this.body.id).then((scheme) => {
      if (scheme.body) {
        this._state.body.fieldConfigurationScheme = scheme.body;
        return scheme.getMapping().then(() => scheme);
      }
    });
  };
}
