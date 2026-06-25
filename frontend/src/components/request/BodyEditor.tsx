"use client";

import { updateDraft } from "@/store/slices/tabsSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { BodyMode, KeyValue } from "@/types";

import { CodeEditor } from "./CodeEditor";
import { KeyValueTable } from "./KeyValueTable";
import { Dropdown } from "../Dropdown";
import styles from "../workspace.module.css";

const MODES: { value: BodyMode; label: string }[] = [
  { value: "none", label: "none" },
  { value: "raw", label: "raw" },
  { value: "form-data", label: "form-data" },
  { value: "urlencoded", label: "x-www-form-urlencoded" },
];

export function BodyEditor() {
  const dispatch = useAppDispatch();
  const tab = useAppSelector((s) => s.tabs.tabs.find((t) => t.id === s.tabs.activeTabId));

  if (!tab) {
    return null;
  }

  const { body_mode, body_raw, body_form } = tab.draft;

  const setForm = (rows: KeyValue[]) => dispatch(updateDraft({ body_form: rows }));

  return (
    <div>
      <div className={styles.radioRow}>
        {MODES.map((mode) => (
          <label key={mode.value} className={styles.radioLabel}>
            <input
              type="radio"
              name="body-mode"
              checked={body_mode === mode.value}
              onChange={() => dispatch(updateDraft({ body_mode: mode.value }))}
            />
            {mode.label}
          </label>
        ))}
      </div>

      {body_mode === "none" && (
        <p className={styles.homeHint}>This request does not have a body.</p>
      )}

      {body_mode === "raw" && (
        <div>
          <div className={styles.bodyToolbar}>
            <Dropdown
              value={tab.draft.body_raw_type ?? "json"}
              options={[
                { value: "json", label: "JSON" },
                { value: "text", label: "Text" },
                { value: "javascript", label: "JavaScript" },
                { value: "html", label: "HTML" },
                { value: "xml", label: "XML" },
              ]}
              onChange={(v) => dispatch(updateDraft({ body_raw_type: v }))}
              minWidth={130}
            />
            <div style={{ flex: 1 }} />
            <button
              className={styles.linkButton}
              onClick={() => {
                try {
                  const formatted = JSON.stringify(JSON.parse(body_raw), null, 2);
                  dispatch(updateDraft({ body_raw: formatted }));
                } catch {
                  dispatch(updateDraft({ body_raw }));
                }
              }}
            >
              Beautify
            </button>
          </div>
          <div style={{ height: 220, border: "1px solid var(--border)" }}>
            <CodeEditor
              value={body_raw}
              onChange={(value) => dispatch(updateDraft({ body_raw: value }))}
              language={(tab.draft.body_raw_type ?? "json") === "json" ? "json" : "text"}
            />
          </div>
        </div>
      )}

      {(body_mode === "form-data" || body_mode === "urlencoded") && (
        <KeyValueTable rows={body_form} onChange={setForm} keyPlaceholder="Key" valuePlaceholder="Value" />
      )}
    </div>
  );
}
