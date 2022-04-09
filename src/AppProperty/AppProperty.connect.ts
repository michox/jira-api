import {JiraApi} from "../JiraApi"
import {JiraCrudType} from "../JiraCrudType";
declare var addonKey: string; //available via the react-layout.hbs in the views folder

interface ConnectProperty<type=any>{
  self: string;
  key: string;
  value: type;
}


export class AppProperty<
  P =any,
  D extends Record<string, JiraCrudType> | JiraCrudType | unknown = unknown
> {
  //<P extends Record<string, Object>, D extends Record<string, JiraCrudType> | unknown = unknown> {
  constructor(protected propertyKey: string, private _property: P = {} as P) {
    this.property = Object();
  }
  details: D = Object();
  get property() {
    return this._property;
  }
  set property(property) {
    this._property = property;
  }

  async read() {
    let response = await JiraApi<ConnectProperty<P>>(`/rest/atlassian-connect/1/addons/${addonKey}/properties/${this.propertyKey}`);
    if (response.body?.value) {
      this.property = response.body.value;
    }
    return this;
  }

  async update(property = this._property) {
    await JiraApi<ConnectProperty<P>>(
      `/rest/atlassian-connect/1/addons/${addonKey}/properties/${this.propertyKey}.backup`,
      this.property,
      "PUT"
    );
    property || console.warn(`updating property of ${this.propertyKey} but the passed value is undefined!`)
    this._property = property;
    await JiraApi<ConnectProperty<P>>(`/rest/atlassian-connect/1/addons/${addonKey}/properties/${this.propertyKey}`, property, "PUT");
    return this;
  }

  async delete() {
    this._property = {} as P;
    return Promise.all([
      JiraApi<ConnectProperty<P>>(`/rest/atlassian-connect/1/addons/${addonKey}/properties/${this.propertyKey}.backup`, {}, "DELETE"),
      JiraApi<ConnectProperty<P>>(`/rest/atlassian-connect/1/addons/${addonKey}/properties/${this.propertyKey}`, {}, "DELETE"),
    ]);
  }

  static async getProperties() {
    return await JiraApi(`/rest/atlassian-connect/1/addons/${addonKey}/properties`, {}, "GET");
  }

  // async readDetails(detailsObject: D) {
  //   try {
  //     if (!Object.keys(this.property).length) {
  //       await this.read();
  //     }
  //     let promiseObject: D = Object();
  //     Object.entries(this.property).forEach(([key, obj]) => {
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
  //       "The program tried to load a jira object type that is unspecified due to a not configured application property with key:",
  //       this.propertyKey
  //     );
  //     return undefined;
  //   }
  // }
}

// export class ForgeAppProperty
