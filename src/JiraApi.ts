import { ConnectResponse, ConnectError, JiraApiOptions } from "./JiraApiTypes";
import { RequestPromiseAPI  } from "request-promise-native";

declare const httpClient: RequestPromiseAPI;

import { CrudState } from "./CrudType";


export async function JiraApi<BodyType = any>(
  url: string, //required if not provided in base argument
  body?: {} | string,
  method: "POST" | "PUT" | "GET" | "DELETE" = "GET",
  headers: {} = {
    Accept: "application/json",
    // "Content-Type": "application/json",
  },
  params?: JiraApiOptions,
  retryCount = 2
): Promise<CrudState<BodyType>> {
  if (typeof body != "string" && typeof body != undefined) {
    body = JSON.stringify(body);
  }
  let options = { ...params, url, body, method, headers };
  let response: CrudState<BodyType> = {
    body: Object(),
    status: "pending",
    error: undefined,
  };


  // console.log('making request', connectOptions);
  await httpClient(url, options).then(
    (response: ConnectResponse) => handleResponse(response),
    (error: ConnectError) => handleError(error)
  );
  if (response.statusCode == 500) {
    //handle internal server error from Jira that can happen any time, especially when many requests are made
    switch (method) {
      case "DELETE": {
        httpClient(url, { ...options, method: "GET" }).then(
          (r: ConnectResponse) => JiraApi(url, body, method, headers, params).then((r) => (response = r)), //retry if still exists
          (err: ConnectError) => {
            if (err.xhr.status === 404 || err.xhr.status === 400) {
              // does not exist anymore, assume deletion worked despite server error
              response.status = "ok";
              response.statusCode = 204;
            } else
              retryCount < 0 && JiraApi(url, body, method, headers, params, --retryCount).then((r) => (response = r)); //assuming a 405 error or another 500 error. Try again and hope for the best. As we don't need to return anything from a delete command this should not break anything
          }
        );
        break;
      }
      case "PUT": {
        retryCount < 0 && (response = await JiraApi(url, body, method, headers, params, --retryCount));
        break;
      }
      case "GET": {
        retryCount < 0 && (response = await JiraApi(url, body, method, headers, params, --retryCount));
        break;
      }
      case "POST": {
        //todo stability: attempt to get all entities and find the result by name.
        // Might be best to handle this on the subclass level as we have a find by name methods available. Unfortunately Jira API is not predictable enough to handle this error here
        throw new Error(
          "The Jira server returned an error and we don't know if the post request was successful. If it was we don't know the id of the created item. If that is ok, the software should have caught this error"
        );
      }
    }
  }

  return response;

  function handleError(e: ConnectError) {
    let error: { "status-code": number; message: string } | typeof response.error;
    try {
      error = JSON.parse(e.err) || e.err;
    } catch (parseError: any) {
      error = {
        errorMessages: [`${e?.xhr?.statusText} Error code ${e?.xhr?.status || "unknown"}, that's all we know`],
      };
    }
    if (error?.hasOwnProperty("message")) {
      response.error = { errorMessages: [(error as { "status-code": number; message: string }).message] };
    } else {
      response.error = error as typeof response.error;
    }
    response.status = "error";
    response.statusCode = e.xhr.status;
    return response;
  }

  function handleResponse(data: ConnectResponse) {
    try {
      response.body = JSON.parse(data?.body);
    } catch (error) {
      response.body = data?.body;
    }
    response.status = "ok";
    response.statusCode = data.xhr.status;
    return response;
  }

}


