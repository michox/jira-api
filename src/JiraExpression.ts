import { AtlassianRequest, CrudState } from "atlassian-request";

interface ExpressionRequest {
  expression: string;
  context?: Context;
  expandMeta?: boolean;
}

interface Context {
  issue?: Issue;
  sprint?: number;
  custom?: Custom;
  project?: Issue;
  serviceDesk?: number;
  issues?: Issues;
  board?: number;
  customerRequest?: number;
}

interface Issues {
  jql: Jql | string;
}

interface Jql {
  maxResults?: number;
  query: string;
  startAt?: number;
  validation?: string;
}

interface Custom {
  myUser: MyUser;
  issuesList: IssuesList[];
  nullField: NullField;
  config: Config;
}

interface Config {
  type: string;
  value: Value;
}

interface Value {
  userId: string;
}

interface NullField {
  type: string;
}

interface IssuesList {
  type: string;
  key?: string;
  id?: number;
}

interface MyUser {
  accountId: string;
  type: string;
}

interface Issue {
  key: string;
}

interface JiraExpressionResult<ValueType = any> {
  value: ValueType;
  meta: MetaResult;
}

interface MetaResult {
  complexity?: Complexity;
  issues: IssuesResult;
}

interface IssuesResult {
  jql: JqlResult;
}

interface JqlResult {
  startAt: number;
  maxResults: number;
  count: number;
  totalCount: number;
  validationWarnings: string[];
}

interface Complexity {
  steps: Steps;
  expensiveOperations: Steps;
  beans: Steps;
  primitiveValues: Steps;
}

interface Steps {
  value: number;
  limit: number;
}

/**
 *
 * @param props the request
 * @param startAt is only used if context.issues.jql of type string
 * @returns the result of the expression with status and possible errors
 */
export async function evaluateJiraExpression<ValueType = any>(props: ExpressionRequest, startAt = 0) {
  let { expandMeta, ...request } = props;
  if (typeof request?.context?.issues?.jql == "string") {
    request.context.issues.jql = { query: request?.context?.issues?.jql, maxResults: 100, startAt: 0 };
  }
  return AtlassianRequest<JiraExpressionResult<ValueType>>(
    `/rest/api/3/expression/eval${expandMeta && "?expand=meta.complexity"}`,
    request,
    "POST"
  );
}

/**
 * if issues are provided in the context via a jql, the jql result is limited to 100 issues.
 * in some cases, such as mapping of issue properties you need to repeat the request until you have covered all issues in the jql.
 * returns an array of the results of each evaluation.
 */
export async function evaluateJiraExpressionIteratively<ValueType = any>(props: ExpressionRequest) {
  let evaluations: JiraExpressionResult<ValueType>[] = [];
  let count = 0;
  let state: CrudState<JiraExpressionResult<ValueType>[]> = Object();
  do {
    let result = await evaluateJiraExpression<ValueType>(props, count).then(
      async (result) => (result.error ? await evaluateJiraExpression<ValueType>(props, count) : result) //retry once
    );
    if (result.error) {
      console.error(result.error); //if failed again, cancel request
      state = { ...result, body: evaluations };
      break;
    }
    evaluations.push(result.body);
    count = result.body.meta.issues.jql.count;
  } while (evaluations[evaluations.length - 1].meta.issues.jql.totalCount > count);
  state = { status: "ok", statusCode:200, body: evaluations };
  return state;
}

export  async function getIssueIdsForKeys(keys: string[]): Promise<number[]> {
    return evaluateJiraExpressionIteratively<number[]>({
      context: { issues: { jql: { query: `key in [${keys}]` } } },
      expression: `return issues.map(issue=>issue.id)`,
    }).then((result) => result.body.flatMap(evaluation=>evaluation.value));
  }