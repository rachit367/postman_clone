"use client";

import { useState } from "react";

import { openModal } from "@/store/slices/uiSlice";
import { useAppDispatch } from "@/store/hooks";

import { CollectionsTab } from "./CollectionsTab";
import { EnvironmentsSection } from "./EnvironmentsSection";
import { HistoryTab } from "./HistoryTab";
import { StubBadge } from "../StubBadge";
import styles from "../workspace.module.css";

type SidebarView = "collections" | "history";

export function Sidebar() {
  const dispatch = useAppDispatch();
  const [view, setView] = useState<SidebarView>("collections");
  const [search, setSearch] = useState("");

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarIcons}>
        <button
          className={`${styles.iconButton} ${view === "collections" ? styles.iconButtonActive : ""}`}
          title="Collections"
          onClick={() => setView("collections")}
        >
          ▤
        </button>
        <button
          className={`${styles.iconButton} ${view === "history" ? styles.iconButtonActive : ""}`}
          title="History"
          onClick={() => setView("history")}
        >
          ◴
        </button>
        <button
          className={styles.iconButton}
          title="New collection"
          onClick={() => dispatch(openModal({ type: "new-collection" }))}
        >
          +
        </button>
      </div>

      <div className={styles.searchRow}>
        <input
          className={styles.searchInput}
          placeholder={view === "collections" ? "Search collections" : "Search history"}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.sidebarSection}>
        {view === "collections" ? (
          <CollectionsTab search={search} />
        ) : (
          <HistoryTab search={search} />
        )}
      </div>

      <EnvironmentsSection />

      <div>
        <div className={styles.sectionHeader}>
          Specs <StubBadge />
        </div>
        <div className={styles.sectionHeader}>
          Flows <StubBadge />
        </div>
      </div>
    </div>
  );
}
