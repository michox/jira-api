import JiraType from "./JiraCrudType";
import JiraApi from "./JiraApi";
import { CrudState, PageBean } from "./CrudType";

export interface Status {
  id: string | number;
  name?: string;
  properties?: any;
}

export type PostFunction =
  | {
      type: "FireIssueEventFunction";
      configuration: { event: { id: string | number } };
    }
  | { type: "AssignToCurrentUserFunction" }
  | { type: "AssignToLeadFunction" }
  | { type: "AssignToReporterFunction" }
  | { type: "ClearFieldValuePostFunction"; configuration: { fieldId: string } }
  | {
      type: "CopyValueFromOtherFieldPostFunction";
      configuration: {
        sourceFieldId: string;
        destinationFieldId: string;
        copyType: "same" | "parent";
      };
    }
  | {
      type: "TriggerWebhookFunction";
      configuration: { webhook: { id: string | number } };
    }
  | {
      type: "UpdateIssueCustomFieldPostFunction";
      configuration: {
        mode: "replace" | "append";
        fieldId: string;
        fieldValue: string;
      };
    }
  | {
      type: "UpdateIssueFieldFunction";
      configuration: {
        fieldId:
          | "description"
          | "environment"
          | "priority"
          | "resolution"
          | "summary"
          | "timeoriginalestimate"
          | "timeestimate"
          | "timespent";
        fieldValue: any;
      };
    }
  | {
      type: "UpdateIssueFieldFunction";
      configuration: {
        fieldId: "assignee";
        fieldValue: "automatic" | "" | string; //"" to unassign, string of a accountId for specific user
      };
    }
  | {
      type: "SetIssueSecurityFromRoleFunction";
      configuration: {
        projectRole: {
          id: string | number;
        };
        issueSecurityLevel: {
          id: string | number;
        };
      };
    }
  | {
      configuration?: any; //todo define which types need what configuration
      type:
        | "UpdateIssueStatusFunction" //default function that triggers at initial transition. Documentation is unclear about purpose
        | "CreateCommentFunction" //default function that triggers at initial transition. Documentation is unclear about purpose
        | "IssueStoreFunction" //default function that triggers at initial transition. Documentation is unclear about purpose
        | "CreateCrucibleReviewWorkflowFunction";
      //add your custom connect rules in the form appKey__moduleKey and configuration:{value:stringified JSON for field config}
    };

type Resolution = "None" | "Done" | "Won't Do" | "Duplicate" | "Declined" | "Cannot Reproduce";

interface ConditionSet {
  operator?: "AND" | "OR";
  type?: string; //todo specify Condition types
  configuration?: any; //experimental
  conditions?: ConditionSet[]; //todo: test this
}

interface Validator {
  configuration: any;
  type: string; //todo specify Validator types
}

interface WorkflowTransitionRules {
  conditions?: ConditionSet;
  validators?: Validator[];
  postFunctions?: PostFunction[];
}

interface WorkflowTransitionScreen {
  id: string | number;
}

interface TransitionProperties {
  name: string;
  description?: string;
  from?: (string | number)[];
  to: string | number;
  type: "global" | "initial" | "directed";
  rules?: WorkflowTransitionRules;
  screen?: WorkflowTransitionScreen;
  properties?: any;
  id?: number; //don't supply on create, only when reading
}

export interface WorkflowCreateRequest {
  name: string;
  statuses: Status[];
  transitions: TransitionProperties[];
  description?: string;
}

interface WorkflowDetails {
  id: WorkflowId;
  description?: string;
  transitions?: TransitionProperties[];
  statuses: Status[];
  isDefault?: boolean;
  schemes?: { id: string; name: string }[];
  created?: string;
  updated?: string;
}

type WorkflowId =
  | {
      name: string;
      entityId?: string;
    }
  | {
      name?: string;
      entityId: string;
    };

export default class Workflow extends JiraType<WorkflowDetails, WorkflowCreateRequest> {
  constructor() {
    super("/rest/api/3/workflow");
  }

  /**
   * @attention does not cause a rerender.
   * @param id at least part of the id of the workflow you want to work with.
   * @returns
   */
  WithId(id: WorkflowId) {
    this._state.body = { ...this._state.body, id };
    return this;
  }

  async create(requestBody: WorkflowCreateRequest) {
    let state = await JiraApi<WorkflowId>(this._defaultRestAddress, requestBody, "POST");
    this.state = { ...state, body: { ...requestBody, id: state.body } };

    return this;
  }

  async read() {
    this.body = (await Workflow.find(this.body.id)) || this.body;
    return this;
  }

  static async find(id: WorkflowId) {
    let name = id.name ? "&workflowName=" + id.name : "";
    let allWorkflows: PageBean<WorkflowDetails> = await getWorkflowPage();
    let workflow = filterWorkflow();
    while (!workflow && !allWorkflows.isLast) {
      allWorkflows = await getWorkflowPage(allWorkflows.maxResults + allWorkflows.startAt);
      workflow = filterWorkflow();
    }


    return workflow;

    async function getWorkflowPage(startAt = 0): Promise<PageBean<WorkflowDetails>> {
      return (
        await JiraApi(
          `/rest/api/3/workflow/search?expand=statuses.properties,transitions.rules,transitions.properties&startAt=${startAt}${name}`
        )
      ).body;
    }

    function filterWorkflow() {
      return allWorkflows.values.find(
        (workflow: WorkflowDetails) =>
          //since both name and entityId are unique, it is enough to check for one
          id?.name === workflow.id.name || id?.entityId === workflow.id.entityId
      );
    }
  }

  static async deleteAllUnused() {
    let getPage = async (startAt = 0) => {
      return JiraApi<PageBean<{ id: number; schemes: any[] }>>(
        `/rest/api/3/workflow/search?expand=schemes&startAt=` + startAt
      ).then(({ body }) => body);
    };
    let page = await getPage();
    let unusedItems: any[] = [];
    page.values.forEach((value) => value.schemes.length || unusedItems.push(value));
    while (!page.isLast) {
      page = await getPage(page.startAt + page.maxResults);
      page.values.forEach((value) => value.schemes.length || unusedItems.push(value));
    }

    return Promise.all(unusedItems.map((item) => new Workflow().WithId(item.id).delete()));
  }

  async delete() {
    if (!this.body.id.entityId) {
      await this.read();
    }
    if (!this.body.id.entityId) {
      console.debug(
        "can't delete the workflow because retrieving of the entity id failed. Check if you have the right name configured", JSON.stringify(this.body.id)
      );
      return this;
    }
    if (this.body.id.entityId.startsWith("11111111") || this.body.id.entityId.startsWith("00000000")) {
      //default jira workflows which can't be deleted
      return this;
    }
    super.delete(`${this._defaultRestAddress}/${this.body.id.entityId}`);
    return this;
  }
  /**
   * @brief recreates the workflow but this time with the approval steps as specified in the params
   */
  async WithApprovals(
    params: [
      {
        statusId: string | number;
        approveTransitionName: string;
        rejectTransitionName: string;
        approversFieldId: string;
      }
    ]
  ) {
    if (!this.body.id) {
      await this.read();
    }
    await new Workflow().WithId(this.body.id).delete(); // delete the workflow so it can be recreated...
    let { id, description, transitions, statuses, ...rest } = this.body;
    let newRequestBody: WorkflowCreateRequest = {
      statuses: statuses.map(({ name, ...s }) => s),
      name: id.name!,
      description,
      transitions: transitions!.map(({ id, screen, ...t }) =>
        screen ? { ...t, screen: { id: screen.id } } : { ...t }
      ),
    };

    params.forEach((param) => {
      param.approversFieldId = param.approversFieldId;
      let approveTransitionId: number | string, rejectTransitionId: number | string;
      this.body.transitions?.forEach((transition, index) => {
        let { id, ...transitionRequestBody } = transition;
        if (transition.name === param.approveTransitionName) {
          approveTransitionId = id!;
          addApprovalCondition(transitionRequestBody);
        } else if (transition.name === param.rejectTransitionName) {
          rejectTransitionId = id!;
          addApprovalCondition(transitionRequestBody);
        }

        this.body.transitions![index] = transitionRequestBody;
      });
      let i = newRequestBody.statuses.findIndex((status) => status.id === param.statusId);

      newRequestBody.statuses[i].properties = {
        "approval.transition.approved": approveTransitionId!,
        "approval.transition.rejected": rejectTransitionId!,
        "approval.condition.value": "100",
        "approval.condition.type": "percent",
        "approval.active": "true",
        "approval.field.id": param.approversFieldId,
        "approval.pre-populated.field.id": "",
      };
    });

    return this.create(newRequestBody);

    function addApprovalCondition(transitionRequestBody: TransitionProperties) {
      let condition = { type: "BlockInProgressApprovalCondition" };
      if (transitionRequestBody.rules === undefined) {
        transitionRequestBody.rules = { conditions: { operator: "AND", conditions: [condition] } };
      }
      if (transitionRequestBody.rules.conditions === undefined) {
        transitionRequestBody.rules.conditions = { operator: "AND", conditions: [condition] };
      } else {
        if (!transitionRequestBody.rules.conditions.conditions?.length) {
          transitionRequestBody.rules.conditions.conditions = [condition];
        } else {
          transitionRequestBody.rules.conditions.conditions.push(condition);
        }
      }
    }
  }
}

export const unassignPostFunction: PostFunction = {
  type: "UpdateIssueFieldFunction",
  configuration: { fieldId: "assignee", fieldValue: "" },
};

export const assignToPostFunction: (assigneeId: string) => PostFunction = (assigneeId) => {
  return {
    type: "UpdateIssueFieldFunction",
    configuration: { fieldId: "assignee", fieldValue: assigneeId },
  };
};

export const setResolutionPostFunction: (resolution: Resolution) => PostFunction = (resolution) => {
  return {
    type: "UpdateIssueFieldFunction",
    configuration: { fieldId: "resolution", fieldValue: resolution },
  };
};

export const setAssigneeToPositionAssignee = () => {
  //@todo:functional: make this a connect workflow module
  let assigneeOfPrimaryPosition = "";
  //getPrimaryCandidateIssue
  //getPrimaryCandidateAssignee
  if (!assigneeOfPrimaryPosition) {
    let postFunction: PostFunction = { type: "AssignToCurrentUserFunction" };
    return postFunction;
  } else return assignToPostFunction(assigneeOfPrimaryPosition);
};

export const copyReporterToApprover = (destinationFieldId: string) => {
  let postFunction: PostFunction = {
    type: "CopyValueFromOtherFieldPostFunction",
    configuration: { copyType: "same", sourceFieldId: "reporter", destinationFieldId },
  };
  return postFunction;
};

export const addDefaultApprover = (accountId: string, destinationFieldId: string) => {
  let postFunction: PostFunction = {
    type: "UpdateIssueCustomFieldPostFunction",
    configuration: { mode: "append", fieldId: destinationFieldId, fieldValue: accountId }, //@todo: check if this works as expected or if a ", " has to be added to account ID to represent an array
  };
  return postFunction;
};
