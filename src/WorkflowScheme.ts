import { JiraCrudType } from "./JiraCrudType";
import { JiraApi } from "./JiraApi";
import { CrudState, PageBean } from "./CrudType";

interface IssueTypeMappings {
  [issueTypeId: number | string]: string;
}

export interface WorkflowSchemeCreateRequest {
  name: string;
  description: string;
  defaultWorkflow?: string;
  issueTypeMappings: IssueTypeMappings;
  updateDraftIfNeeded?: boolean;
}

export interface WorkflowSchemeDetails extends WorkflowSchemeCreateRequest {
  id: number;
  originalDefaultWorkflow?: string;
  originalIssueTypeMappings?: IssueTypeMappings;
  draft?: boolean;
  lastModifiedUser: any;
  lastModified: string;
  self: string;
}

export interface WorkflowSchemeResponseValue {
  workflowScheme: WorkflowSchemeDetails;
  projectIds: string[]; //projects that use this workflow scheme
}

export interface WorkflowSchemeAssociationContainer {
  values: WorkflowSchemeResponseValue[];
}

export class WorkflowScheme extends JiraCrudType<WorkflowSchemeDetails, WorkflowSchemeCreateRequest> {
  constructor() {
    super(`/rest/api/3/workflowscheme`);
  }

  static readAllWorkflowSchemes = async (
    projectIds?: number[] | string[]
  ): Promise<WorkflowSchemeAssociationContainer> => {
    let query = "";
    if (projectIds) {
      query = `/project?`;
      projectIds.forEach((projectId) => {
        query += `projectId=${projectId}&`;
      });
      query = query.slice(0, query.length - 1);
    }

    return JiraApi(`/rest/api/3/workflowscheme${query}`).then((requestState: CrudState) => {
      return requestState.body;
    });
  };

  static async deleteAllUnused() {
    let getPage = async (startAt = 0) => {
      return JiraApi<PageBean<{ id: number }>>(`/rest/api/3/workflowscheme?startAt=` + startAt).then(
        ({ body }) => body
      );
    };
    let page = await getPage();
    let unusedItems: any[] = [];
    page.values.forEach((value) => unusedItems.push(value));
    while (!page.isLast) {
      page = await getPage(page.startAt + page.maxResults);
      page.values.forEach((value) => unusedItems.push(value));
    }

    return Promise.all(unusedItems.map((item) => new WorkflowScheme().WithId(item.id).delete()));
  }
}

export class IssueTypeWorkflow extends JiraCrudType {
  constructor(workflowSchemeId: number | string) {
    super(`/rest/api/3/workflowscheme/${workflowSchemeId}/issuetype`);
  }
}
