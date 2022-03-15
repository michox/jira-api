import React, { useState, useEffect } from "react";
import "regenerator-runtime/runtime";

export interface CrudState<BodyType = any> {
  body: BodyType;
  status: "ok" | "error" | "pending";
  statusCode?: number;
  error?: { errorMessages: string[]; errors?: any };
}

export interface PageBean<ContentType> {
  maxResults: number;
  startAt: number;
  total: number;
  isLast: boolean;
  values: ContentType[];
  nextPage?: string;
}

export abstract class CrudType<BodyType extends { id?: string | number } = any, RequestType = any> {
  constructor(
    protected _defaultRestAddress: string,
    protected _defaultCreateAddress?: string,
    protected _defaultReadAddress?: string,
    protected _defaultUpdateAddress?: string,
    protected _defaultDeleteAddress?: string
  ) {
    if (_defaultRestAddress.endsWith("/")) {
      this._defaultRestAddress = _defaultRestAddress.slice(0, -1);
    }
  }

  WithId(id: number | string | {}) {
    this._state.body = { ...this._state.body, id: id };
    return this;
  }

  protected abstract fetchFunction(
    destination: string,
    body: string | {} | undefined,
    method: "POST" | "PUT" | "GET" | "DELETE"
  ): Promise<CrudState<BodyType>>;

  protected abstract handleErrorMessage(error: { errorMessages: string[]; errors?: any }): void;

  protected async monitoredFetchFunction(
    destination: string,
    body: string | {} | undefined,
    method: "POST" | "PUT" | "GET" | "DELETE"
  ) {
    this.status = "pending";
    return this.fetchFunction(destination, body, method).then(async (response) => {
      this.setState(response);
      if (response.error) {
        this.handleErrorMessage(response.error);
      }
      return;
    });
  }

  _state: CrudState<BodyType> = { status: "pending", body: {} as BodyType };

  set state(state: CrudState<BodyType>) {
    this.setState(state);
  }
  get state() {
    return this._state;
  }

  setState = (state: CrudState<BodyType>) => {
    this._state = state;
  };

  /*------------------------- BODY Properties ----------------------------*/
  get body() {
    return this._state.body;
  }
  set body(body) {
    this.setState({ ...this._state, body: body });
  }

  /*------------------------ STATUS Properties ----------------------------*/
  get status() {
    return this._state.status;
  }
  set status(status) {
    this.setState({ ...this._state, status: status });
  }

  /*------------------------ ERROR Properties ----------------------------*/
  get error() {
    return this._state.error;
  }
  set error(error: CrudState["error"]) {
    this.setState({ ...this._state, error: error });
    error && this.handleErrorMessage(error);
  }

    /*------------------------ STATUS CODE Properties ----------------------------*/
  get statusCode() {
    return this._state.statusCode;
  }
  set statusCode(statusCode) {
    this.setState({ ...this._state, statusCode: statusCode });
  }

  /*-------------------------- CRUD Methods ------------------------------*/
  async create(body: RequestType, createAddress = this._defaultCreateAddress || this._defaultRestAddress) {
    await this.monitoredFetchFunction(createAddress, body, "POST");
    return this;
  }

  async read(readAddress = this._defaultReadAddress || `${this._defaultRestAddress}/${this.body.id}`) {
    await this.monitoredFetchFunction(readAddress, undefined, "GET");
    return this;
  }

  /**
   * @brief during update, the body will be deleted in most API endpoints. We use the available data as that can be enough in many cases, however, depending on the use case you might need to call read() afterward updating
   * @param data the data
   * @param updateAddress specify if this deviates from the default address or you want to add additional parameters. Use WithId(id).update() if you just want to specify the id
   * @returns the object
   */
  async update(
    data: Partial<RequestType> | BodyType | any = this.body,
    updateAddress = this._defaultUpdateAddress || `${this._defaultRestAddress}/${this.body?.id}`
  ) {
    let id = this.body?.id;
    await this.monitoredFetchFunction(updateAddress, data, "PUT");
    
    //@ts-ignore body can be empty string 
    if (this.body === undefined || this.body === "") this.body = data;
    if (this.body.id === undefined) this.body.id = id;
    return this;
  }

  async delete(deleteAddress = this._defaultDeleteAddress || `${this._defaultRestAddress}/${this.body?.id}`) {
    await this.monitoredFetchFunction(deleteAddress, {}, "DELETE");
    return this;
  }

  async readAll(startAt = 0) {
    //@ts-ignore override response type of fetch function
    return this.fetchFunction(this._defaultRestAddress + "?startAt=" + startAt, {}, "GET") as Promise<
      //@ts-ignore override response type of fetch function
      CrudState<PageBean<BodyType>>
    >;
  }

  async readByName(name: string) {
    let response = await this.readAll();
    let responsePage = response.body;
    if (responsePage.hasOwnProperty("values") && responsePage.values[0].hasOwnProperty("name")) {
      //@ts-ignore did manual type checking
      let result = responsePage.values.find((v) => v.name === name);
      while (!result && !responsePage.isLast) {
        responsePage = (await this.readAll()).body;
        //@ts-ignore did manual type checking
        result = responsePage.values.find((v) => v.name === name);
      }
      if (result) this.setState({ ...response, body: result });
      else
        this.setState({
          ...this.state,
          status: "error",
          error: { errorMessages: [`could not find entity with name ${name} at ${this._defaultRestAddress}`] },
        });
      return this;
    } else {
      throw new Error("readByName server response is unexpected. Please override function in derivative class.");
    }
  }
}

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
