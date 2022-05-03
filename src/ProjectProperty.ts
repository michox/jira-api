import { AtlassianRequest, CrudState } from "atlassian-request";
import { JiraCrudType } from "./JiraCrudType";

export class ProjectProperty<BodyType = any> extends JiraCrudType<BodyType> {
  constructor(readonly projectIdOrKey: string, readonly propertyKey: string) {
    super(`/rest/api/3/project/${projectIdOrKey}/properties`);
    this.WithId(propertyKey);
  }
  async create(body: BodyType) {
    return this.update(body);
  }
  static async readAll<ResponseType = any>(projectIdOrKey: string) {
    let response = await AtlassianRequest<{ keys: { self: string; key: string }[] }>(
      `/rest/api/3/project/${projectIdOrKey}/properties`
    );
    let finalResult: CrudState<Array<{ key: string; value: ResponseType }>> = {
      status: "pending",
      body: Array<{ key: string; value: ResponseType }>(),
    };
    if (response.error) {
      finalResult = { ...response, body: Array<{ key: string; value: ResponseType }>() };
    } else {
      finalResult.body = await Promise.all(
        response.body.keys.map((key) =>
          AtlassianRequest<{ key: string; value: ResponseType }>(`/rest/api/3/project/${projectIdOrKey}/properties`).then(
            (result) => {
              if (result.error) finalResult = { ...result, body: finalResult.body };
              return result.body;
            }
          )
        )
      );
    }
    if (finalResult.error==undefined){
        finalResult.status = 'ok'
        finalResult.statusCode = 200
    }

    return finalResult;
  }
}
