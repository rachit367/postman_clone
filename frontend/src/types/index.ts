export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

export interface KeyValue {
  key: string;
  value: string;
  enabled: boolean;
}

export type BodyMode = "none" | "raw" | "form-data" | "urlencoded";
export type AuthType = "none" | "bearer" | "basic";

export interface RequestScripts {
  pre_request: string;
  test: string;
}

export interface RequestSettings {
  ssl_verification: boolean;
  follow_redirects: boolean;
  max_redirects: number;
  encode_url: boolean;
  http_version: string;
  follow_original_method: boolean;
  follow_authorization_header: boolean;
  remove_referer_on_redirect: boolean;
  strict_http_parser: boolean;
  disable_cookie_jar: boolean;
  use_server_cipher_suite: boolean;
}

export interface ApiRequest {
  id: number;
  collection_id: number;
  folder_id: number | null;
  name: string;
  method: HttpMethod;
  url: string;
  query_params: KeyValue[];
  headers: KeyValue[];
  body_mode: BodyMode;
  body_raw: string | null;
  body_raw_type: string | null;
  body_form: KeyValue[];
  auth_type: AuthType;
  auth_data: Record<string, string>;
  scripts: RequestScripts;
  settings: RequestSettings;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Folder {
  id: number;
  collection_id: number;
  name: string;
  created_at: string;
  requests: ApiRequest[];
}

export interface Collection {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  folders: Folder[];
  requests: ApiRequest[];
}

export interface EnvironmentVariable {
  id: number;
  key: string;
  value: string;
  is_secret: boolean;
  enabled: boolean;
}

export interface Environment {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  variables: EnvironmentVariable[];
}

export interface HistoryEntry {
  id: number;
  method: string;
  url: string;
  request_snapshot: Record<string, unknown>;
  status_code: number | null;
  response_time_ms: number | null;
  response_size_bytes: number | null;
  response_snapshot: Record<string, unknown>;
  created_at: string;
}

export interface TestResult {
  name: string;
  passed: boolean;
  error: string | null;
}

export interface RunResponse {
  status_code: number;
  status_text: string;
  headers: KeyValue[];
  body: string;
  time_ms: number;
  size_bytes: number;
  tests: TestResult[];
  logs: string[];
}

export interface RunError {
  error: { type: string; message: string };
}
