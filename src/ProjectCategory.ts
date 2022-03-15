import JiraApi from "./JiraApi";
import JiraType from "./JiraCrudType";

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
export default class ProjectCategory extends JiraType<ProjectCategoryDetails, ProjectCategoryCreateRequest> {
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
    let response = await JiraApi<ProjectCategoryDetails[]>(this._defaultRestAddress);
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
