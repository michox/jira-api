import { AtlassianRequest } from "atlassian-request";
import { getIssueIdsForKeys } from "./JiraExpression";
import { JiraCrudType } from "./JiraCrudType";
import { JQL } from "./JQL";

type BulkSetRequest = {
  propertyKey: string;
  filter?: Filter;
} & ({ value: any } | { expression: string });

interface Filter {
  hasProperty?: boolean;
  entityIds?: number[] | string[];
  currentValue?: any;
}

interface BulkSetResponse {
  self: string;
  id: string;
  description: string;
  status: string;
  message: string;
  result: Result;
  submittedBy: number;
  progress: number;
  elapsedRuntime: number;
  submitted: number;
  started: number;
  finished: number;
  lastUpdate: number;
}

interface Result {
  updatedTotal: number;
}

export class IssueProperty<BodyType=any> extends JiraCrudType<BodyType> {
  constructor(readonly propertyKey: string,readonly issueIdOrKey: string, initialBody?:BodyType) {
    super(`/rest/api/3/issue/${issueIdOrKey}/properties/${propertyKey}`);
    this.body = initialBody ? initialBody : this.body
  }

  async create(body: BodyType) {    
    return this.update(body);
  }

  static getProperties(issueIdOrKey: string) {
    return AtlassianRequest<{ keys: { self: string; key: string }[] }>(`/rest/api/3/issue/${issueIdOrKey}/properties`);
  }
  getProperties(){return IssueProperty.getProperties(this.issueIdOrKey)}

  async isInScope(scope:{projectIds:string[], issueTypeIds:string[]}){
    return JQL(`key = ${this.issueIdOrKey} AND project in ${scope.projectIds} AND issueTypeId in ${scope.issueTypeIds}`).then(r=>!!r.body?.issues?.length)
  }



  static bulkSetProperties(
    props: BulkSetRequest | Array<{ issueID: number; properties: { [propertyKey: string]: any } }>
  ) {
    if (Array.isArray(props)) {
      return AtlassianRequest<BulkSetResponse>(`/rest/api/3/issue/properties/multi`, { issues: props }, "POST");
    } else {
      let { propertyKey, ...rest } = props;
      return AtlassianRequest<BulkSetResponse>(`/rest/api/3/issue/properties/${propertyKey}`, rest, "PUT");
    }
  }
}

export class IssuePropertyList<BodyType> extends IssueProperty<BodyType[]> {
  static async push(props: { propertyKey: string; values: any | any[]; filter?: Filter }) {
    let { values, ...request } = { ...props, expression: "" };
    request.expression = `return (issue.properties['${request.propertyKey}'] || []).concat(${values}})`;
    return IssueProperty.bulkSetProperties(request);
  }

  /**
   * 
   * @param props:propertyKey: the property you want to update
   * @param props:propertyFilter a JiraExpression predicate that is evaluated for each property in the list and returns the updated property. 
   * e.g. 'property => property.id = 10006 ? {...property, ...' + JSON.stringify(myNewObject) + '}: property' 
   * available context is user and issue
   * @param props:value: the value that should replace the list entries that satisfy the filter condition, 
   * @returns 
   */
  static async remap(props: { propertyKey: string; mapExpression: string; filter?: Filter }) {
    let { mapExpression, ...request } = { ...props, expression: "" };
    request.expression = `return issue.properties['${request.propertyKey}']?.map(${mapExpression}})`;
    if (typeof props.filter?.entityIds == "string") {
      props.filter.entityIds = await getIssueIdsForKeys(props.filter.entityIds);
    }
    return IssueProperty.bulkSetProperties(request);
  }
  static async remove(props: { propertyKey: string; propertyFilter: string; filter?: Filter }) {
    let { propertyFilter, ...request } = { ...props, expression: "" };
    request.expression = `return issue.properties['${request.propertyKey}']?.filter(${propertyFilter}})`;
    if (typeof props.filter?.entityIds == "string") {
      props.filter.entityIds = await getIssueIdsForKeys(props.filter.entityIds);
    }
    return IssueProperty.bulkSetProperties(request);
  }

  async push(values: BodyType | BodyType[]) {
    return IssuePropertyList.push({
      values,
      propertyKey: this.propertyKey,
      filter: { entityIds: [this.issueIdOrKey] },
    });
  }
/**
 * 
 * @param mapExpression a JiraExpression predicate that is evaluated for each property in the list and returns the updated property. 
   * e.g. 'property => property.id = 10006 ? {...property, ...' + JSON.stringify(myNewObject) + '}: property'
   * available context is user and issue
 * @returns the result of the property set execution
 */
  async remap(mapExpression: string) {
    return IssuePropertyList.remap({
      mapExpression,
      propertyKey: this.propertyKey,
      filter: { entityIds: [this.issueIdOrKey] },
    });
  }
  async remove(propertyFilter: string) {
    return IssuePropertyList.remove({
      propertyFilter,
      propertyKey: this.propertyKey,
      filter: { entityIds: [this.issueIdOrKey] },
    });
  }


}
