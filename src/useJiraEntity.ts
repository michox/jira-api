import { CrudType } from "JiraApi/CrudType";
import { JiraCrudType } from "JiraCrudType";
import React, { useState, useEffect } from "react";
import "regenerator-runtime/runtime";

export declare type CrudHookInitParam<T extends CrudType> = {
  createProps?: Parameters<T["create"]>[0];
  readProps?: Parameters<T["read"]>[0];
};

export function useCrudHook<T extends CrudType>(object: T, initParam?: CrudHookInitParam<T>) {
  [object._state, object.setState] = useState(object._state);

  useEffect(() => {
    if (initParam && initParam.hasOwnProperty("readProps")) {
      object.read(initParam.readProps);
    } else if (initParam && initParam.hasOwnProperty("createProps")) {
      object.create(initParam.createProps);
    }
  }, []);

  return object;
}

export function useJiraEntity<T extends JiraCrudType>(object: T, initialization?: CrudHookInitParam<T>) {
  // let { showFlag } = useFlags();
  // object.showFlag = useCallback(showFlag, []);
  useCrudHook(object, initialization);
  return object;
}
