import { KeyValue, RequestScripts, RequestSettings } from "@/types";

export function blankRow(): KeyValue {
  return { key: "", value: "", enabled: true };
}

export function defaultScripts(): RequestScripts {
  return { pre_request: "", test: "" };
}

export function defaultSettings(): RequestSettings {
  return {
    ssl_verification: true,
    follow_redirects: true,
    max_redirects: 10,
    encode_url: true,
    http_version: "auto",
    follow_original_method: false,
    follow_authorization_header: false,
    remove_referer_on_redirect: false,
    strict_http_parser: false,
    disable_cookie_jar: false,
    use_server_cipher_suite: false,
  };
}
