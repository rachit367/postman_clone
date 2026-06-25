"use client";

import { useState } from "react";

import { updateDraft } from "@/store/slices/tabsSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

import { CodeEditor } from "./CodeEditor";
import styles from "../workspace.module.css";

export function ScriptsEditor() {
  const dispatch = useAppDispatch();
  const tab = useAppSelector((s) => s.tabs.tabs.find((t) => t.id === s.tabs.activeTabId));
  const [active, setActive] = useState<"pre_request" | "test">("pre_request");

  if (!tab) {
    return null;
  }

  const scripts = tab.draft.scripts;
  const setScript = (value: string) =>
    dispatch(updateDraft({ scripts: { ...scripts, [active]: value } }));

  return (
    <div>
      <div className={styles.radioRow}>
        <label className={styles.radioLabel}>
          <input
            type="radio"
            checked={active === "pre_request"}
            onChange={() => setActive("pre_request")}
          />
          Pre-request Script
        </label>
        <label className={styles.radioLabel}>
          <input
            type="radio"
            checked={active === "test"}
            onChange={() => setActive("test")}
          />
          Tests
        </label>
      </div>
      <p className={styles.settingsDesc} style={{ marginBottom: 8 }}>
        Use pm.environment.get/set, pm.response, pm.test, pm.expect, console.log.
      </p>
      <div style={{ height: 240, border: "1px solid var(--border)" }}>
        <CodeEditor value={scripts[active]} onChange={setScript} language="javascript" />
      </div>
    </div>
  );
}
