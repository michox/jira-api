import { JiraApi } from "JiraApi/JiraApi";
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


export async function JQL(props: JQLRequest | string) {
    if (typeof props === 'string') {
        return JiraApi<JQLSearchResult>(`/rest/api/3/search`, {jql:props}, "POST");
    }
  return JiraApi<JQLSearchResult>(`/rest/api/3/search`, props, "POST");
}
