import { AtlassianRequest, CrudState } from "atlassian-request";
import { Fields, IssueBean } from "./Issue";

export interface JQLRequest {
  expand?: JQLExpand[];
  jql: string;
  maxResults?: number;
  fieldsByKeys?: boolean; //default is false
  fields?: string[]; // '*all' = Returns all fields.  '*navigable' Returns navigable fields.  Any issue field or command (e.g. *all), prefixed with a minus to exclude.
  startAt?: number;
  validateQuery?: "strict" | "warn" | "none";
  properties?: string[]; //accepts up to 5 properties
}

export type JQLExpand =
  | "renderedFields" // Returns field values rendered in HTML format.
  | "names" // Returns the display name of each field.
  | "schema" // Returns the schema describing a field type.
  | "transitions" // Returns all possible transitions for the issue.
  | "operations" // Returns all possible operations for the issue.
  | "editmeta" // Returns information about how each field can be edited.
  | "changelog" // Returns a list of recent updates to an issue, sorted by date, starting from the most recent.
  | "versionedRepresentations"; // Instead of fields, returns versionedRepresentations a JSON array containing each version of a field's value, with the highest numbered item representing the most recent version.

export interface JQLSearchResult {
  expand: string;
  startAt: number;
  /** set maxResults to -1 to iteratively make requests and obtain all issues until all issues are retrieved 
   * or until the server failed to respond 5 times which may happen for very large samples. Try to limit the scope 
   * of your JQL search if that happens or set a lower maxResults value
   */
  maxResults: number;
  total: number;
  issues: IssueBean[];
  warningMessages: string[];
  names: Names;
  schema: Schema;
}
interface Schema {
  assignee: Assignee;
  status: Assignee;
}

interface Assignee {
  type: string;
  system: string;
}

interface Names {
  assignee: string;
  status: string;
}

export async function JQL(props: JQLRequest | string): Promise<CrudState<JQLSearchResult>> {
  if (typeof props === "string") {
    return AtlassianRequest<JQLSearchResult>(`/rest/api/3/search`, { jql: props }, "POST");
  } else if (props.maxResults && (props.maxResults > 100 || props.maxResults < 0)) {
    let maxResults = props.maxResults === -1 ? Number.MAX_SAFE_INTEGER : props.maxResults;
    let firstPage = await JQL({ ...props, maxResults: 100 });
    if (firstPage.body.total > 100) {
      let numberOfRequests = Math.min(Math.ceil(firstPage.body.total / 100), props.maxResults);
      let requests = Array<Promise<CrudState<JQLSearchResult>>>();
      for (let i = 1; i < numberOfRequests; i++) {
        requests.push(JQL({ ...props, maxResults: 100, startAt: i * 100 }));
      }
      let remainingPages = await Promise.all(requests);
      let retryCount = 0;
      while (remainingPages.filter((page) => page.error).length && retryCount++ < 5) {
        await Promise.all(
          (remainingPages = await Promise.all(
            remainingPages.map(async (req, index) => {
              if (req.error) req = await JQL({ ...props, maxResults: 100, startAt: (index + 1) * 100 });
              return req;
            })
          ))
        ); //retry if there is an error at any of the requests which might happen if too many requests are done at the same times
      }
      if (retryCount) {
        firstPage.error={errors:remainingPages.filter((page) => page.error).map(page=>page.error),
          errorMessages:['the server failed to respond to some requests and not all issues may be returned']}
      }
      firstPage.body.issues.push(...remainingPages.map((page) => page.body.issues).flat());
      return firstPage;
    }
  }
  return AtlassianRequest<JQLSearchResult>(`/rest/api/3/search`, props, "POST");
}
