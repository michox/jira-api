import { CrudState, AtlassianRequest } from "atlassian-request";
import { JiraCrudType } from "../JiraCrudType";
declare var addonKey: string; //available via the react-layout.hbs in the views folder

interface ConnectProperty<type = any> {
  self: string;
  key: string;
  value: type;
}

export class AppProperty<P = any, D extends Record<string, JiraCrudType> | JiraCrudType | unknown = unknown> {
  //<P extends Record<string, Object>, D extends Record<string, JiraCrudType> | unknown = unknown> {
  constructor(protected propertyKey: string, initialBody?: P) {
    this.state = { body: initialBody || Object(), status: "pending" };
  }
  details: D = Object();
  get body() {
    return this.state.body;
  }
  set body(body: P) {
    this.state = { ...this.state, body };
  }
  get error() {
    return this.state.error;
  }
  set error(error) {
    this.state = { ...this.state, error };
  }

  state: CrudState<P>;

  async read() {
    this.state = await AtlassianRequest<ConnectProperty<P>>(
      `/rest/atlassian-connect/1/addons/${addonKey}/properties/${this.propertyKey}`
    ).then((response) => ({ ...response, body: response.body.value }));
    return this;
  }

  async update(body = this.body) {
    await AtlassianRequest<ConnectProperty<P>>(
      `/rest/atlassian-connect/1/addons/${addonKey}/properties/${this.propertyKey}.backup`,
      this.body,
      "PUT"
    );
    body || console.warn(`updating body of ${this.propertyKey} but the passed value is undefined!`);
    this.body = body;
    await AtlassianRequest<ConnectProperty<P>>(
      `/rest/atlassian-connect/1/addons/${addonKey}/properties/${this.propertyKey}`,
      body,
      "PUT"
    );
    return this;
  }

  async delete() {
    this.body = {} as P;
    await AtlassianRequest<ConnectProperty<P>>(
      `/rest/atlassian-connect/1/addons/${addonKey}/properties/${this.propertyKey}`,
      {},
      "DELETE"
    );
    return this;
  }

  static async getProperties() {
    return await AtlassianRequest(`/rest/atlassian-connect/1/addons/${addonKey}/properties`, {}, "GET");
  }

  // async readDetails(detailsObject: D) {
  //   try {
  //     if (!Object.keys(this.body).length) {
  //       await this.read();
  //     }
  //     let promiseObject: D = Object();
  //     Object.entries(this.body).forEach(([key, obj]) => {
  //       if (obj.hasOwnProperty("id")) {
  //         //@ts-ignore
  //         promiseObject[key as keyof D] = detailsObject.WithId(obj.id).read(); // probably need to do a deep clone here
  //       }
  //     });
  //     //@ts-ignore
  //     this.details = awaitObject(promiseObject);
  //     return this.details;
  //   } catch (error) {
  //     console.log(
  //       "The program tried to load a jira object type that is unspecified due to a not configured application body with key:",
  //       this.propertyKey
  //     );
  //     return undefined;
  //   }
  // }
}

// export class ForgeAppProperty
