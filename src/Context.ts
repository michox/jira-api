import {JiraCrudType} from "./JiraCrudType";

export interface ContextCreateRequest {
  name: string;
  projectIds?: number[];
  issueTypeIds?: number[];
  description?: string;
}

export class Context extends JiraCrudType {
  constructor(fieldId: number) {
    super(`/rest/api/3/field/${fieldId}/context`);
  }
  create(body: ContextCreateRequest){return super.create(body);}
}
