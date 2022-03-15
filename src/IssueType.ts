import {JiraCrudType} from "./JiraCrudType";
import {Avatar} from "./Avatar";
import {JiraApi} from "./JiraApi";

interface BriefAvatar {
  path: string;
  size: 16 | 24 | 32 | 48;
}

export interface IssueTypeCreateRequest {
  name: string;
  description: string;
  avatar?: number | BriefAvatar; //if number is provided it is assumed that the Avatar already exists
  // @todo take in Screen Configurations as objects and create as necessary
  hierarchyLevel?: 0 | -1; //0 for normal issue, -1 for subtype
}

export interface IssueTypeDetails {
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
  project: Project;
}

interface Project {
  self: string;
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
  simplified: boolean;
  avatarUrls: AvatarUrls;
  projectCategory: AvatarUrls;
}

interface AvatarUrls {}

export class IssueType extends JiraCrudType<IssueTypeDetails, IssueTypeCreateRequest> {
  constructor() {
    super("/rest/api/3/issuetype");
  }
  public createdAvatar?: Avatar;

  async create(body: IssueTypeCreateRequest) {
    let { avatar, ...requestBody } = body;
    await super.create(requestBody);
    if (this.statusCode === 409) {
      await this.readByName(body.name);
    }
    if (avatar) {
      if (typeof avatar !== "number") {
        this.createdAvatar = new Avatar("issuetype", this.body.id, avatar.size, avatar.path);
        await this.createdAvatar.load();
      }
      try {
        await this.update({ avatarId: avatar || this.createdAvatar?.body.id });
      } catch (error) {
        //if avatar is specified, update issue type to reflect change
        console.error(`api request failed with error: ${error}. Does avatar ${avatar} exist?`);
      }
    }
    return this;
  }

  static async readAll() {
    IssueType.allIssueTypes = (await JiraApi<IssueTypeDetails[]>(`/rest/api/3/issuetype`)).body;
    return this;
  }
  private static allIssueTypes: IssueTypeDetails[] | undefined;

  async readByName(name: string) {
    IssueType.allIssueTypes || (await IssueType.readAll());
    let issueType = IssueType.allIssueTypes!.find((t) => t.name === name);
    if (issueType) {
      this.setState({ body: issueType, status: "ok", statusCode: 200 });
    } else
      this.setState({
        body: this.body,
        status: "error",
        statusCode: 404,
        error: { errorMessages: ["Could not find IssueType"] },
      });
    return this;
  }
}
