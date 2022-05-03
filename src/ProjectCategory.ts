import {AtlassianRequest} from "atlassian-request";
import {JiraCrudType} from "./JiraCrudType";

export interface ProjectCategoryCreateRequest {
  name: string;
  description?: string;
}

interface ProjectCategoryDetails {
  self: string;
  id: string;
  name: string;
  description: string;
}
export class ProjectCategory extends JiraCrudType<ProjectCategoryDetails, ProjectCategoryCreateRequest> {
  constructor() {
    super("/rest/api/3/projectCategory");
  }
  async createOrUpdate(props: ProjectCategoryCreateRequest) {
    await this.create(props);
    if (this.error) {
      await this.readByName(props.name);
      await this.update(props);
    }
    return this
  }

  async readByName(name: string) {
    let response = await AtlassianRequest<ProjectCategoryDetails[]>(this._defaultRestAddress);
    let allCategories = response.body;
    let result = allCategories.find((c) => c.name === name);
    console.log(result);
    if (result) this.setState({ ...response, body: result });
    else
      this.setState({
        body: this.body,
        status: "error",
        error: { errorMessages: [`could not find ProjectCategory with name ${name} at ${this._defaultRestAddress}`] },
      });
    return this;
  }
}
