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
        <span className={styles.filterIcon}>≡</span>
        <input
          className={styles.searchInput}
          placeholder={view === "collections" ? "Filter" : "Search history"}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className={styles.iconButton}
          title="New collection"
          onClick={() => dispatch(openModal({ type: "new-collection" }))}
        >
          +
        </button>
        <button
          className={styles.iconButton}
          title="More"
          onClick={() => dispatch(openModal({ type: "coming-soon", title: "More options" }))}
        >
          ⋯
        </button>
      </div>

      <div className={styles.sidebarSection}>
        {view === "collections" ? (
          <CollectionsTab search={search} />
        ) : (
          <HistoryTab search={search} />
        )}
      </div>

      <EnvironmentsSection />

      <StubSection label="Specs" />
      <StubSection label="Flows" />
    </div>
  );
}

function StubSection({ label }: { label: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className={styles.sectionHeader} onClick={() => setOpen(!open)}>
        <span className={styles.sectionChevron}>{open ? "⌄" : "›"}</span>
        {label} <StubBadge />
      </div>
      {open && <div className={styles.stubSectionBody}>Coming soon</div>}
    </div>
  );
}
