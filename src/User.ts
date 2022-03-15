import { JiraCrudType } from "./JiraCrudType";
import { JiraApi } from "./JiraApi";
import { encodeObject } from "./JiraApiTypes";

interface UserSearchResult {
  self: string;
  key: string;
  accountId: string;
  accountType: string;
  name: string;
  avatarUrls: AvatarUrls;
  displayName: string;
  active: boolean;
  emailAddress?: string;
}

interface AvatarUrls {
  "48x48": string;
  "24x24": string;
  "16x16": string;
  "32x32": string;
}

interface UserPickerSearchResult {
  users: UserPickerResult[];
  total: number;
  header: string;
}

interface UserPickerResult {
  accountId: string;
  accountType: string;
  name: string;
  key: string;
  html: string;
  displayName: string;
  avatarUrl: string;
}

export class User extends JiraCrudType {
  constructor() {
    super("/rest/api/3/user");
  }

  static async findUser(
    body:
      | ({
          startAt?: number; //The index of the first item to return in a page of results (page offset).    //Default: 0, Format: int32
          maxResults?: number; //The maximum number of items to return per page.    //Default: 50, Format: int32
          property?: string; //A query string used to search properties. Property keys are specified by path, so property keys containing dot (.) or equals (=) characters cannot be used. The query string cannot be specified using a JSON object. Example: To search for the value of nested from {"something":{"nested":1,"other":2}} use thepropertykey.something.nested=1. Required, unless accountId or query is specified.
        } & {
          query: string; //A query string that is matched against user attributes ( displayName, and emailAddress) to find relevant users. The string can match the prefix of the attribute's value. For example, query=john matches a user with a displayName of John Smith and a user with an emailAddress of johnson@example.com. Required, unless accountId or property is specified.
        })
      | {
          username: string; // The exact username to search for
        }
      | {
          accountId: string; // A query string that is matched exactly against a user accountId. Required, unless query or property is specified. Max length: 128
        }
  ) {
    return (await JiraApi<UserSearchResult[]>(`/rest/api/3/user?${encodeObject(body)}`)).body;
  }

  static async getUser(body: {
    accountId: string; // A query string that is matched exactly against a user accountId. Required, unless query or property is specified. Max length: 128
  }) {
    return (await JiraApi<UserSearchResult>(`/rest/api/3/user?${encodeObject(body)}`)).body;
  }

  static async findUsersAssignableToProjects(
    body: { projectKeys: string[]; startAt?: number; maxResults?: number } & (
      | { query?: string }
      | { accountId?: string }
    )
  ) {
    return (await JiraApi<UserSearchResult[]>(`/user/assignable/multiProjectSearch?${encodeObject(body)}`)).body;
  }

  static async findUsersAssignableToIssues(
    body: { issueKeys: string[]; startAt?: number; maxResults?: number } & ({ query?: string } | { accountId?: string })
  ) {}

  static async findUsersWithPermissions(
    body: {
      permissions: string[];
      startAt?: number;
      maxResults?: number;
    } & ({ query?: string } | { accountId?: string })
  ) {}

  static async findUsersForPicker(
    body: {
      startAt?: number;
      maxResults?: number;
      showAvatar?: boolean;
      excludeAccounts?: string[];
    } & ({ query: string } | { accountId: string })
  ) {
    return (await JiraApi<UserPickerSearchResult>(`/rest/api/3/user/picker?${encodeObject(body)}`)).body;
  }
}
