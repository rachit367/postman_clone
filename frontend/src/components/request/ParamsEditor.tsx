"use client";

import { syncUrlWithParams } from "@/lib/url";
import { updateDraft } from "@/store/slices/tabsSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { KeyValue } from "@/types";

import { KeyValueTable } from "./KeyValueTable";

export function ParamsEditor() {
  const dispatch = useAppDispatch();
  const tab = useAppSelector((s) => s.tabs.tabs.find((t) => t.id === s.tabs.activeTabId));

  if (!tab) {
    return null;
  }

  const onChange = (rows: KeyValue[]) => {
    dispatch(updateDraft({ query_params: rows, url: syncUrlWithParams(tab.draft.url, rows) }));
  };

  return (
    <KeyValueTable
      rows={tab.draft.query_params}
      onChange={onChange}
      keyPlaceholder="Parameter"
      valuePlaceholder="Value"
    />
  );
}
