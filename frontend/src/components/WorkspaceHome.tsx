"use client";

import { openModal } from "@/store/slices/uiSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

import { StubBadge } from "./StubBadge";
import styles from "./workspace.module.css";

export function WorkspaceHome() {
  const dispatch = useAppDispatch();
  const collections = useAppSelector((s) => s.collections.items);
  const workspace = useAppSelector((s) =>
    s.workspaces.items.find((w) => w.id === s.workspaces.selectedId)
  );

  return (
    <div className={styles.home}>
      <div className={styles.homeTitle}>{workspace ? workspace.name : "Workspace"}</div>
      <div className={styles.homeMeta}>
        <span>rachit</span>
        <span>·</span>
        <span>{collections.length} collections</span>
        <StubBadge label="Docs" />
        <StubBadge label="Updates" />
        <StubBadge label="Apps" />
      </div>
      <hr className={styles.homeDivider} />
      <div className={styles.homeHint}>
        Add documentation to help others get started…
      </div>
      <button
        className={styles.pinButton}
        onClick={() => dispatch(openModal({ type: "coming-soon", title: "Pin collections" }))}
      >
        + Pin collections
      </button>
    </div>
  );
}
