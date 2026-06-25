import { KeyValue } from "@/types";
import { blankRow } from "./defaults";

export function paramsToQueryString(params: KeyValue[]): string {
  const active = params.filter((p) => p.enabled && p.key);
  if (active.length === 0) {
    return "";
  }
  return active
    .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
    .join("&");
}

export function syncUrlWithParams(url: string, params: KeyValue[]): string {
  const [base] = url.split("?");
  const query = paramsToQueryString(params);
  return query ? `${base}?${query}` : base;
}

export function parseParamsFromUrl(url: string): KeyValue[] {
  const queryIndex = url.indexOf("?");
  if (queryIndex === -1) {
    return [blankRow()];
  }
  const query = url.slice(queryIndex + 1);
  const rows: KeyValue[] = [];
  for (const pair of query.split("&")) {
    if (!pair) {
      continue;
    }
    const [rawKey, rawValue = ""] = pair.split("=");
    rows.push({
      key: decodeURIComponent(rawKey),
      value: decodeURIComponent(rawValue),
      enabled: true,
    });
  }
  rows.push(blankRow());
  return rows;
}
