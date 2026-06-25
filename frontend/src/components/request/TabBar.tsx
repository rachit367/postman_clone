"use client";

import { closeTab, openNewTab, setActiveTab } from "@/store/slices/tabsSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

import styles from "../workspace.module.css";

export function TabBar() {
  const dispatch = useAppDispatch();
  const tabs = useAppSelector((s) => s.tabs.tabs);
  const activeId = useAppSelector((s) => s.tabs.activeTabId);
  const showHome = useAppSelector((s) => s.tabs.showHome);

  return (
    <div className={styles.tabBar}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`${styles.tab} ${tab.id === activeId && !showHome ? styles.tabActive : ""}`}
          onClick={() => dispatch(setActiveTab(tab.id))}
        >
          <span className={`${styles.tabMethod} method-${tab.draft.method.toLowerCase()}`}>
            {tab.draft.method}
          </span>
          <span className={styles.tabName}>{tab.draft.name}</span>
          {tab.dirty && <span className={styles.tabDirty} />}
          <span
            className={styles.tabClose}
            onClick={(e) => {
              e.stopPropagation();
              dispatch(closeTab(tab.id));
            }}
          >
            ✕
          </span>
        </button>
      ))}
      <button className={styles.tabAdd} onClick={() => dispatch(openNewTab())}>
        +
      </button>
    </div>
  );
}
