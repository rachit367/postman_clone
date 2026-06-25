"use client";

import { api } from "@/lib/api";
import { syncUrlWithParams, parseParamsFromUrl } from "@/lib/url";
import { fetchHistory } from "@/store/slices/historySlice";
import { openModal, pushToast } from "@/store/slices/uiSlice";
import {
  setResponse,
  setRunError,
  setRunning,
  updateDraft,
} from "@/store/slices/tabsSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { HttpMethod, RunError, RunResponse } from "@/types";

import { Dropdown } from "../Dropdown";
import { StubBadge } from "../StubBadge";
import styles from "../workspace.module.css";

const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

export function MethodUrlBar() {
  const dispatch = useAppDispatch();
  const tab = useAppSelector((s) => s.tabs.tabs.find((t) => t.id === s.tabs.activeTabId));
  const activeEnv = useAppSelector((s) => s.environments.items.find((e) => e.is_active));

  if (!tab) {
    return null;
  }

  const onUrlChange = (url: string) => {
    dispatch(updateDraft({ url, query_params: parseParamsFromUrl(url) }));
  };

  const send = async () => {
    dispatch(setRunning(true));
    const payload = {
      method: tab.draft.method,
      url: tab.draft.url,
      query_params: tab.draft.query_params,
      headers: tab.draft.headers,
      body_mode: tab.draft.body_mode,
      body_raw: tab.draft.body_raw,
      body_raw_type: tab.draft.body_raw_type,
      body_form: tab.draft.body_form,
      auth_type: tab.draft.auth_type,
      auth_data: tab.draft.auth_data,
      scripts: tab.draft.scripts,
      settings: tab.draft.settings,
      environment_id: activeEnv?.id ?? null,
    };
    try {
      const result = await api.post<RunResponse & Partial<RunError>>("/run", payload);
      if ("error" in result && result.error) {
        dispatch(setRunError(result.error));
      } else {
        dispatch(setResponse(result as RunResponse));
      }
      dispatch(fetchHistory());
    } catch (err) {
      dispatch(
        setRunError({ type: "client_error", message: (err as Error).message })
      );
    }
  };

  return (
    <div className={styles.urlBar}>
      <Dropdown
        value={tab.draft.method}
        options={METHODS.map((m) => ({
          value: m,
          label: m,
          className: `method-${m.toLowerCase()}`,
        }))}
        onChange={(v) => dispatch(updateDraft({ method: v as HttpMethod }))}
        minWidth={120}
      />
      <input
        className={styles.urlInput}
        placeholder="Enter request URL"
        value={tab.draft.url}
        onChange={(e) => onUrlChange(e.target.value)}
      />
      <button className={styles.sendButton} onClick={send} disabled={tab.sending}>
        {tab.sending ? "Sending…" : "Send"}
      </button>
      <button
        className={styles.saveButton}
        onClick={() => dispatch(openModal({ type: "save-request" }))}
      >
        Save
      </button>
      <button
        className={styles.linkButton}
        title="Share request link"
        onClick={() => {
          navigator.clipboard?.writeText(tab.draft.url).catch(() => undefined);
          dispatch(pushToast("Link copied (stub)", "info"));
        }}
      >
        🔗 <StubBadge />
      </button>
    </div>
  );
}
