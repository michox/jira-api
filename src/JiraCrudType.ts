// import React, { useCallback } from "react";
import { CrudType, AtlassianRequest } from "atlassian-request";
// import { useFlags } from "@atlaskit/flag";
// import { CreateFlagArgs, DismissFn } from "@atlaskit/flag";
// import ErrorFlag from "components/flags/ErrorFlag";

export class JiraCrudType<BodyType = any, RequestType = any> extends CrudType<BodyType, RequestType> {
  constructor(
    protected _defaultRestAddress: string,
    protected _defaultCreateAddress?: string,
    protected _defaultReadAddress?: string,
    protected _defaultUpdateAddress?: string,
    protected _defaultDeleteAddress?: string
  ) {
    super(
      _defaultRestAddress,
      _defaultCreateAddress,
      _defaultReadAddress,
      _defaultUpdateAddress,
      _defaultDeleteAddress
    );
  }

  // declare showFlag: (args: CreateFlagArgs) => DismissFn;

  protected fetchFunction(
    destination: string,
    body: string | {} | undefined,
    method: "POST" | "PUT" | "GET" | "DELETE"
  ) {
    return AtlassianRequest(destination, body, method);
  }

  protected handleErrorMessage(error: { errorMessages: string[]; errors?: any }) {
    // error.errorMessages.forEach((message) => this.showFlag(ErrorFlag(message)));
    // Object.keys(error.errors).forEach((key) => this.showFlag(ErrorFlag(error.errors[key])));
  }
}

