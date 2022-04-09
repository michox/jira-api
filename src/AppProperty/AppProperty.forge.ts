import { storage } from "@forge/api";
import { JiraCrudType } from "../JiraCrudType";
export class AppProperty<
  P extends Record<string, any>,
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
    let response = await storage.get(this.propertyKey);
    if (response.body?.value) {
      this.property = response.body.value;
    }
    return this;
  }

  async update(property = this._property) {
    await storage.set(`${this.propertyKey}.backup`, this.property);
    property || console.warn(`updating property of ${this.propertyKey} but the passed value is undefined!`);
    this._property = property;
    storage.set(`${this.propertyKey}`, this.property);
    return this;
  }

  async delete() {
    this._property = {} as P;
    return Promise.all([storage.delete(`${this.propertyKey}.backup`), storage.delete(this.propertyKey)]);
  }

  static async getProperties() {
    return await storage.query().getMany()
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
