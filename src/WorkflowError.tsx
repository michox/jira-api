import { AppProperty } from "./AppProperty/AppProperty.connect";
import { PageBean } from "JiraApi";
import { JiraApi } from "./JiraApi";
import Panel from "@atlaskit/panel";
import SectionMessage from "@atlaskit/section-message";
import { useQuery, QueryClient, QueryClientProvider, useQueryClient } from "react-query";
import React from "react";

const queryClient = new QueryClient();

interface WorkflowRuleConfiguration {
  workflowId: WorkflowId;
  postFunctions: WorkflowRule[];
  conditions: WorkflowRule[];
  validators: WorkflowRule[];
}

interface WorkflowRule {
  id: string;
  key: string;
  configuration: Configuration;
  transition: Transition;
}

interface Transition {
  id: number;
  name: string;
}

interface Configuration {
  value: string;
  disabled: boolean;
  tag: string;
}

interface WorkflowId {
  name: string;
  draft: boolean;
}

interface WorkflowErrorDetails {}

export class WorkflowError extends AppProperty<Record<string, WorkflowErrorDetails>> {
  constructor(public postFunctionId?: string) {
    super(postFunctionId || "");
  }

  async readPostFunctionId(connectRuleKey: string, workflowName: string, transitionId: number) {
    let pageResponse = await JiraApi<PageBean<WorkflowRuleConfiguration>>(
      `/rest/api/3/workflow/rule/config?expand=transition&types=postfunction&workflowNames=${workflowName}&keys=${connectRuleKey}`
    );
    let postFunction = pageResponse?.body.values
      .find((rule) => rule.workflowId)
      ?.postFunctions.find((postFunction) => postFunction.transition.id == transitionId);
    this.postFunctionId = postFunction?.id;
    postFunction?.id && (this.propertyKey = postFunction?.id);
    return this;
  }

  async pushLog(content: any) {
    if (!this.body) await this.read();
    this.body[new Date().toISOString()] = content;
    return this.update();
  }
}

export function useWorkflowErrorLog(workflowError: WorkflowError) {
  <QueryClientProvider client={queryClient}>
    {() => {
      let queryClient = useQueryClient();
      let { data } = useQuery("getErrorLog", () =>
        workflowError.postFunctionId?.length ? workflowError.read() : null
      );
      if (data == null) {
        console.error("No property key has been defined. Can not read logs");
        return;
      }
      return (
        data &&
        Object.values(data.body)?.length && (
          <SectionMessage
            title="An error occurred in a previous run"
            appearance="error"
            actions={[
              {
                key: "clearLog",
                type: "link",
                props: {
                  children: [<a>Clear Log</a>],
                  onClick: () => workflowError.delete().then(() => queryClient.invalidateQueries("getErrorLog")),
                },
              },
            ]}
          >
            <Panel header="Show Details...">{JSON.stringify(data.body)}</Panel>
          </SectionMessage>
        )
      );
    }}
  </QueryClientProvider>;
}
