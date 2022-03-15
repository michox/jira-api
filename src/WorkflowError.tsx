import {ConnectAppProperty} from "./AppProperty";
import { PageBean } from "./CrudType";
import {JiraApi} from "./JiraApi";
import Panel from "@atlaskit/panel";
import SectionMessage from "@atlaskit/section-message";
import { useQuery, QueryClient, QueryClientProvider } from "react-query";
import React from "react";

let queryClient = new QueryClient();

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

export class WorkflowError extends ConnectAppProperty<Record<string, WorkflowErrorDetails>> {
  constructor(private postFunctionId?: string) {
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
    if (!this.property) await this.read();
    this.property[new Date().toISOString()] = content;
    return this.update();
  }

  renderLogSection() {
    return <QueryClientProvider client={queryClient}>{this.WorkflowErrorLog()}</QueryClientProvider>;
  }

  WorkflowErrorLog() {
    if (this.propertyKey?.length) {
      console.error("No property key has been defined. Can not read logs");
      return;
    }
    let { data } = useQuery("getErrorLog", () => this.read());
    return (
      data &&
      Object.values(data.property)?.length && (
        <SectionMessage
          title="An error occurred in a previous run"
          appearance="error"
          actions={[
            {
              key: "clearLog",
              type: "link",
              props: {
                children: [<a>Clear Log</a>],
                onClick: () => this.delete().then(() => queryClient.invalidateQueries("getErrorLog")),
              },
            },
          ]}
        >
          <Panel header="Show Details...">{JSON.stringify(data.property)}</Panel>
        </SectionMessage>
      )
    );
  }
}
