export interface ConnectResponse {
  xhr: {
    status: number;
    data: string;
    getHeader: (key: string) => string;
    getAllHeaders: () => string;
  };
  body: string | any;
}

export interface ConnectError {
  xhr: {
    status: number;
    statusText?: string;
    err: string;
    getHeader: (key: string) => string;
    getAllHeaders: () => string;
  };
  err: string;
}

export interface JiraError {
  errorMessages: string[];
  errors?: any;
}

export interface JiraApiOptions {
  url?: string;
  body?: string | {} | undefined;
  method?: "POST" | "PUT" | "GET" | "DELETE";
  headers?: {};
  cache?: boolean | undefined;
  contentType?: string | undefined;
  success?: ((responseText: any) => void) | undefined;
  error?: ((responseText: any) => void) | undefined;
  experimental?: boolean | undefined;
  binaryAttachment?: boolean | undefined;
}

export function encodeObject(params: any) {
  return Object.keys(params)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join("&");
}
