"use client";

import { useState } from "react";

import { api } from "@/lib/api";
import { updateDraft } from "@/store/slices/tabsSlice";
import { pushToast } from "@/store/slices/uiSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { AuthType } from "@/types";

import { Dropdown } from "../Dropdown";
import styles from "../workspace.module.css";

const TYPES: AuthType[] = ["none", "bearer", "basic"];

export function AuthEditor() {
  const dispatch = useAppDispatch();
  const tab = useAppSelector((s) => s.tabs.tabs.find((t) => t.id === s.tabs.activeTabId));
  const [reveal, setReveal] = useState(false);

  if (!tab) {
    return null;
  }

  const { auth_type, auth_data } = tab.draft;
  const setData = (patch: Record<string, string>) =>
    dispatch(updateDraft({ auth_data: { ...auth_data, ...patch } }));

  const revealSecret = async (field: string) => {
    if (reveal) {
      setReveal(false);
      return;
    }
    if (tab.requestId && auth_data[field] === "••••••") {
      try {
        const data = await api.get<Record<string, string>>(
          `/requests/${tab.requestId}/auth/reveal`
        );
        dispatch(updateDraft({ auth_data: { ...auth_data, ...data } }));
      } catch {
        dispatch(pushToast("Could not reveal value", "error"));
      }
    }
    setReveal(true);
  };

  return (
    <div>
      <div className={styles.field}>
        <label className={styles.fieldLabel}>Auth type</label>
        <Dropdown
          value={auth_type}
          options={TYPES.map((t) => ({
            value: t,
            label: t === "none" ? "No Auth" : t === "bearer" ? "Bearer Token" : "Basic Auth",
          }))}
          onChange={(v) => dispatch(updateDraft({ auth_type: v as AuthType }))}
          minWidth={160}
        />
      </div>

      {auth_type === "bearer" && (
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Token</label>
          <div className={styles.inlineInput}>
            <input
              className={styles.textInput}
              type={reveal ? "text" : "password"}
              value={auth_data.token ?? ""}
              onChange={(e) => setData({ token: e.target.value })}
            />
            <button className={styles.eyeButton} onClick={() => revealSecret("token")}>
              {reveal ? "🙈" : "👁"}
            </button>
          </div>
        </div>
      )}

      {auth_type === "basic" && (
        <>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Username</label>
            <input
              className={styles.textInput}
              value={auth_data.username ?? ""}
              onChange={(e) => setData({ username: e.target.value })}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Password</label>
            <div className={styles.inlineInput}>
              <input
                className={styles.textInput}
                type={reveal ? "text" : "password"}
                value={auth_data.password ?? ""}
                onChange={(e) => setData({ password: e.target.value })}
              />
              <button className={styles.eyeButton} onClick={() => revealSecret("password")}>
                {reveal ? "🙈" : "👁"}
              </button>
            </div>
          </div>
        </>
      )}

      {auth_type === "none" && (
        <p className={styles.homeHint}>This request does not use authorization.</p>
      )}
    </div>
  );
}
