import {JiraApi} from "./JiraApi";
import {JiraCrudType} from "./JiraCrudType";

type ProjectPermissions =
  | "ADMINISTER_PROJECTS"
  | "BROWSE_PROJECTS"
  | "MANAGE_SPRINTS_PERMISSION" //(Jira Software only)
  | "SERVICEDESK_AGENT" //(Jira Service Desk only)
  | "VIEW_DEV_TOOLS" //(Jira Software only)
  | "VIEW_READONLY_WORKFLOW";

type IssuePermissions =
  | "ASSIGNABLE_USER"
  | "ASSIGN_ISSUES"
  | "CLOSE_ISSUES"
  | "CREATE_ISSUES"
  | "DELETE_ISSUES"
  | "EDIT_ISSUES"
  | "LINK_ISSUES"
  | "MODIFY_REPORTER"
  | "MOVE_ISSUES"
  | "RESOLVE_ISSUES"
  | "SCHEDULE_ISSUES"
  | "SET_ISSUE_SECURITY"
  | "TRANSITION_ISSUES";

type VotersAndWatchersPermissions = "MANAGE_WATCHERS" | "VIEW_VOTERS_AND_WATCHERS";

type CommentsPermissions =
  | "ADD_COMMENTS"
  | "DELETE_ALL_COMMENTS"
  | "DELETE_OWN_COMMENTS"
  | "EDIT_ALL_COMMENTS"
  | "EDIT_OWN_COMMENTS";
type AttachmentsPermissions = "CREATE_ATTACHMENTS" | "DELETE_ALL_ATTACHMENTS" | "DELETE_OWN_ATTACHMENTS";

type TimeTrackingPermissions =
  | "DELETE_ALL_WORKLOGS"
  | "DELETE_OWN_WORKLOGS"
  | "EDIT_ALL_WORKLOGS"
  | "EDIT_OWN_WORKLOGS"
  | "WORK_ON_ISSUES";

interface PermissionSchemeCreateRequest {
  name: string; //The name of the permission scheme. Must be unique.
  description?: string; //A description for the permission scheme.
  scope?: Scope; //The projects in the scope of the permission scheme.
  permissions?: Array<PermissionGrantDetails>; //The permission scheme to create or update. See About permission schemes and grants for more information.
}

interface PermissionSchemeDetails {
  expand: string;
  id: number;
  self: string;
  name: string;
  description: string;
  scope: Scope;
  permissions: Permission[];
}

interface Permission {
  id: number;
  self: string;
  holder: Holder;
  permission: string;
}

interface Scope {
  type: "PROJECT" | "TEMPLATE";
  project: Project;
}

interface Project {
  id?: string;
  key?: string;
}

interface PermissionGrantDetails {
  holder: Holder;
  permission:
    | ProjectPermissions
    | IssuePermissions
    | VotersAndWatchersPermissions
    | CommentsPermissions
    | AttachmentsPermissions
    | TimeTrackingPermissions;
}

interface Holder {
  type:
    | "anyone" // Grant for anonymous users.
    | "applicationRole" // Grant for users with access to the specified application (application name). See Update product access settings for more information.
    | "assignee" // Grant for the user currently assigned to an issue.
    | "group" // Grant for the specified group (group name).
    | "groupCustomField" // Grant for a user in the group selected in the specified custom field (custom field ID).
    | "projectLead" // Grant for a project lead.
    | "projectRole" // Grant for the specified project role (project role ID).
    | "reporter" // Grant for the user who reported the issue.
    | "sd.customer.portal.only " //Jira Service Desk only. Grants customers permission to access the customer portal but not Jira. See Customizing Jira Service Desk permissions for more information.
    | "user" // Grant for the specified user (user ID - historically this was the userkey but that is deprecated and the account ID should be used).
    | "userCustomField"; // Grant for a user selected in the specified custom field (custom field ID).
  parameter?: string; //the group, role, accountId, customFieldId or nothing, depending on the type
}

export class PermissionScheme extends JiraCrudType<PermissionSchemeDetails, PermissionSchemeCreateRequest> {
  constructor() {
    super("/rest/api/3/permissionscheme");
  }
  static readAll() {
    return JiraApi<{ permissionSchemes: PermissionSchemeDetails[] }>("/rest/api/3/permissionscheme");
  }
}

export class PermissionGrant extends JiraCrudType<PermissionGrantDetails, PermissionGrantDetails> {
  constructor(permissionSchemeId: string | number) {
    super("/rest/api/3/permissionscheme/" + permissionSchemeId);
  }
}
