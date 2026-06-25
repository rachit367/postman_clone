"use client";

import { updateDraft } from "@/store/slices/tabsSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { KeyValue } from "@/types";

import { KeyValueTable } from "./KeyValueTable";

export function HeadersEditor() {
  const dispatch = useAppDispatch();
  const tab = useAppSelector((s) => s.tabs.tabs.find((t) => t.id === s.tabs.activeTabId));

  if (!tab) {
    return null;
  }

  const onChange = (rows: KeyValue[]) => {
    dispatch(updateDraft({ headers: rows }));
  };

  return (
    <KeyValueTable
      rows={tab.draft.headers}
      onChange={onChange}
      keyPlaceholder="Header"
      valuePlaceholder="Value"
    />
  );
}
