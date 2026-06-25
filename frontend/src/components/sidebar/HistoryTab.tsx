"use client";

import { blankRow, defaultScripts, defaultSettings } from "@/lib/defaults";
import { clearHistory, deleteHistoryEntry } from "@/store/slices/historySlice";
import { openHistoryInTab } from "@/store/slices/tabsSlice";
import { pushToast } from "@/store/slices/uiSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { DraftRequest } from "@/store/slices/tabsSlice";
import { HistoryEntry, HttpMethod, KeyValue } from "@/types";

import styles from "../workspace.module.css";

function toDraft(entry: HistoryEntry): DraftRequest {
  const snap = (entry.request_snapshot || {}) as Record<string, unknown>;
  const rows = (value: unknown): KeyValue[] => {
    const list = Array.isArray(value) ? (value as KeyValue[]) : [];
    return [...list, blankRow()];
  };
  return {
    name: "History request",
    method: (snap.method as HttpMethod) || "GET",
    url: (snap.url as string) || "",
    query_params: rows(snap.query_params),
    headers: rows(snap.headers),
    body_mode: (snap.body_mode as DraftRequest["body_mode"]) || "none",
    body_raw: (snap.body_raw as string) || "",
    body_raw_type: (snap.body_raw_type as string) || "json",
    body_form: rows(snap.body_form),
    auth_type: (snap.auth_type as DraftRequest["auth_type"]) || "none",
    auth_data: (snap.auth_data as Record<string, string>) || {},
    scripts: (snap.scripts as DraftRequest["scripts"]) || defaultScripts(),
    settings: (snap.settings as DraftRequest["settings"]) || defaultSettings(),
  };
}

export function HistoryTab({ search }: { search: string }) {
  const dispatch = useAppDispatch();
  const history = useAppSelector((s) => s.history.items);
  const filtered = history.filter((h) =>
    h.url.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className={styles.sectionHeader}>
        History
        {history.length > 0 && (
          <button
            className={styles.miniButton}
            style={{ marginLeft: "auto" }}
            onClick={() => {
              dispatch(clearHistory());
              dispatch(pushToast("History cleared", "info"));
            }}
          >
            Clear
          </button>
        )}
      </div>
      {filtered.map((entry) => (
        <button
          key={entry.id}
          className={styles.treeRow}
          onClick={() => dispatch(openHistoryInTab(toDraft(entry)))}
        >
          <span className={`${styles.methodTag} method-${entry.method.toLowerCase()}`}>
            {entry.method}
          </span>
          <span className={styles.rowGrow}>{entry.url}</span>
          <span className={styles.rowActions}>
            <button
              className={styles.miniButton}
              onClick={(e) => {
                e.stopPropagation();
                dispatch(deleteHistoryEntry(entry.id));
              }}
            >
              ✕
            </button>
          </span>
        </button>
      ))}
    </div>
  );
}
