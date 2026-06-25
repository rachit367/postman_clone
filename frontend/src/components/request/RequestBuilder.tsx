"use client";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { setActiveSubTab } from "@/store/slices/tabsSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

import { AuthEditor } from "./AuthEditor";
import { BodyEditor } from "./BodyEditor";
import { HeadersEditor } from "./HeadersEditor";
import { MethodUrlBar } from "./MethodUrlBar";
import { ParamsEditor } from "./ParamsEditor";
import { ResponseViewer } from "./ResponseViewer";
import { ScriptsEditor } from "./ScriptsEditor";
import { SettingsEditor } from "./SettingsEditor";
import { StubBadge } from "../StubBadge";
import styles from "../workspace.module.css";

const SUB_TABS = ["params", "auth", "headers", "body", "scripts", "settings"];

export function RequestBuilder() {
  const dispatch = useAppDispatch();
  const tab = useAppSelector((s) => s.tabs.tabs.find((t) => t.id === s.tabs.activeTabId));

  if (!tab) {
    return null;
  }

  const renderPanel = () => {
    switch (tab.activeSubTab) {
      case "auth":
        return <AuthEditor />;
      case "headers":
        return <HeadersEditor />;
      case "body":
        return <BodyEditor />;
      case "scripts":
        return <ScriptsEditor />;
      case "settings":
        return <SettingsEditor />;
      default:
        return <ParamsEditor />;
    }
  };

  const activeParams = tab.draft.query_params.filter((p) => p.enabled && p.key).length;
  const customHeaders = tab.draft.headers.filter((h) => h.enabled && h.key).length;
  const headerCount = 7 + customHeaders;
  const hasBody =
    tab.draft.body_mode !== "none" &&
    (tab.draft.body_raw.trim().length > 0 ||
      tab.draft.body_form.some((r) => r.key));
  const hasScripts =
    tab.draft.scripts.pre_request.trim().length > 0 ||
    tab.draft.scripts.test.trim().length > 0;

  const badgeFor = (name: string) => {
    if (name === "params" && activeParams > 0) {
      return <span className={styles.tabCount}>{activeParams}</span>;
    }
    if (name === "headers") {
      return <span className={styles.tabCount}>{headerCount}</span>;
    }
    if (name === "body" && hasBody) {
      return <span className={styles.tabDot} />;
    }
    if (name === "scripts" && hasScripts) {
      return <span className={styles.tabDot} />;
    }
    if (name === "settings") {
      return <StubBadge />;
    }
    return null;
  };

  return (
    <div className={styles.builder}>
      <MethodUrlBar />
      <div className={styles.subTabs}>
        {SUB_TABS.map((name) => (
          <button
            key={name}
            className={`${styles.subTab} ${tab.activeSubTab === name ? styles.subTabActive : ""}`}
            onClick={() => dispatch(setActiveSubTab(name))}
          >
            {name === "auth" ? "Authorization" : name.charAt(0).toUpperCase() + name.slice(1)}
            {badgeFor(name)}
          </button>
        ))}
      </div>
      <PanelGroup direction="vertical" style={{ flex: 1 }}>
        <Panel defaultSize={50} minSize={20}>
          <div className={styles.subTabPanel}>{renderPanel()}</div>
        </Panel>
        <PanelResizeHandle className={styles.resizeY} />
        <Panel defaultSize={50} minSize={20}>
          <ResponseViewer />
        </Panel>
      </PanelGroup>
    </div>
  );
}
