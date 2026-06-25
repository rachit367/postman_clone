"use client";

import { useState } from "react";

import { updateDraft } from "@/store/slices/tabsSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { KeyValue } from "@/types";

import { KeyValueTable } from "./KeyValueTable";
import styles from "../workspace.module.css";

const AUTO_HEADERS = [
  { key: "Content-Type", value: "application/json" },
  { key: "User-Agent", value: "PostmanClone/1.0" },
  { key: "Accept", value: "*/*" },
  { key: "Accept-Encoding", value: "gzip, deflate, br" },
  { key: "Connection", value: "keep-alive" },
  { key: "Host", value: "<calculated when request is sent>" },
  { key: "Content-Length", value: "<calculated when request is sent>" },
];

export function HeadersEditor() {
  const dispatch = useAppDispatch();
  const tab = useAppSelector((s) => s.tabs.tabs.find((t) => t.id === s.tabs.activeTabId));
  const [showAuto, setShowAuto] = useState(false);

  if (!tab) {
    return null;
  }

  const onChange = (rows: KeyValue[]) => {
    dispatch(updateDraft({ headers: rows }));
  };

  return (
    <div>
      <div className={styles.autoHeaderBar}>
        <button className={styles.linkButton} onClick={() => setShowAuto(!showAuto)}>
          {showAuto ? "Hide" : "Show"} auto-generated headers ({AUTO_HEADERS.length})
        </button>
      </div>
      {showAuto && (
        <table className={styles.kvTable}>
          <tbody>
            {AUTO_HEADERS.map((header) => (
              <tr key={header.key} className={styles.autoHeaderRow}>
                <td className={styles.kvCheck}>
                  <input type="checkbox" checked readOnly />
                </td>
                <td>
                  <span className={styles.autoHeaderKey}>{header.key}</span>
                </td>
                <td>
                  <span className={styles.autoHeaderValue}>{header.value}</span>
                </td>
                <td className={styles.kvDelete}></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <KeyValueTable
        rows={tab.draft.headers}
        onChange={onChange}
        keyPlaceholder="Header"
        valuePlaceholder="Value"
      />
    </div>
  );
}
