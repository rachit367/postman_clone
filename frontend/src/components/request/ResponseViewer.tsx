"use client";

import { useState } from "react";

import { useAppSelector } from "@/store/hooks";

import { CodeEditor } from "./CodeEditor";
import styles from "../workspace.module.css";

function prettyJson(body: string): string {
  try {
    return JSON.stringify(JSON.parse(body), null, 2);
  } catch {
    return body;
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  return `${(bytes / 1024).toFixed(1)} KB`;
}

const TABS = ["pretty", "raw", "headers", "tests", "console"];

export function ResponseViewer() {
  const tab = useAppSelector((s) => s.tabs.tabs.find((t) => t.id === s.tabs.activeTabId));
  const [view, setView] = useState("pretty");

  if (!tab) {
    return null;
  }

  if (tab.error) {
    return (
      <div className={styles.responsePanel}>
        <div className={styles.errorBanner}>
          <strong>{tab.error.type}</strong>: {tab.error.message}
        </div>
      </div>
    );
  }

  const response = tab.response;
  if (!response) {
    return (
      <div className={styles.responsePanel}>
        <div className={styles.responseEmpty}>
          {tab.sending ? "Sending request…" : "Send a request to see the response"}
        </div>
      </div>
    );
  }

  const ok = response.status_code < 400;
  const passed = response.tests.filter((t) => t.passed).length;

  return (
    <div className={styles.responsePanel}>
      <div className={styles.responseMeta}>
        <span className={styles.metaItem}>
          Status: <span className={ok ? styles.metaStrong : styles.metaError}>
            {response.status_code} {response.status_text}
          </span>
        </span>
        <span className={styles.metaItem}>
          Time: <span className={styles.metaStrong}>{response.time_ms} ms</span>
        </span>
        <span className={styles.metaItem}>
          Size: <span className={styles.metaStrong}>{formatSize(response.size_bytes)}</span>
        </span>
      </div>
      <div className={styles.subTabs}>
        {TABS.map((name) => (
          <button
            key={name}
            className={`${styles.subTab} ${view === name ? styles.subTabActive : ""}`}
            onClick={() => setView(name)}
          >
            {name.charAt(0).toUpperCase() + name.slice(1)}
            {name === "tests" && response.tests.length > 0 && (
              <span> ({passed}/{response.tests.length})</span>
            )}
          </button>
        ))}
      </div>
      <div className={styles.responseBody}>
        {view === "pretty" && (
          <CodeEditor value={prettyJson(response.body)} language="json" readOnly />
        )}
        {view === "raw" && (
          <CodeEditor value={response.body} language="text" readOnly />
        )}
        {view === "headers" &&
          response.headers.map((header, index) => (
            <div key={index} className={styles.consoleLine}>
              <strong>{header.key}</strong>: {header.value}
            </div>
          ))}
        {view === "tests" &&
          (response.tests.length === 0 ? (
            <div className={styles.responseEmpty}>No tests ran.</div>
          ) : (
            response.tests.map((test, index) => (
              <div key={index} className={styles.testRow}>
                <span className={test.passed ? styles.testPass : styles.testFail}>
                  {test.passed ? "PASS" : "FAIL"}
                </span>
                <span>{test.name}</span>
                {test.error && <span className={styles.testFail}>— {test.error}</span>}
              </div>
            ))
          ))}
        {view === "console" &&
          (response.logs.length === 0 ? (
            <div className={styles.responseEmpty}>No console output.</div>
          ) : (
            response.logs.map((line, index) => (
              <div key={index} className={styles.consoleLine}>
                {line}
              </div>
            ))
          ))}
      </div>
    </div>
  );
}
