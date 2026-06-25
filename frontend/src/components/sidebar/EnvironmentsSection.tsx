"use client";

import { useState } from "react";

import { activateEnvironment } from "@/store/slices/environmentsSlice";
import { openModal } from "@/store/slices/uiSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

import styles from "../workspace.module.css";

export function EnvironmentsSection() {
  const dispatch = useAppDispatch();
  const environments = useAppSelector((s) => s.environments.items);
  const [open, setOpen] = useState(true);

  return (
    <div>
      <div className={styles.sectionHeader} onClick={() => setOpen(!open)}>
        <span className={styles.sectionChevron}>{open ? "⌄" : "›"}</span>
        Environments
        <button
          className={styles.miniButton}
          style={{ marginLeft: "auto" }}
          title="Manage environments"
          onClick={(e) => {
            e.stopPropagation();
            dispatch(openModal({ type: "environment-manager" }));
          }}
        >
          +
        </button>
      </div>
      {open &&
        environments.map((env) => (
          <button
            key={env.id}
            className={styles.treeRow}
            onClick={() => dispatch(activateEnvironment(env.id))}
          >
            <span className={styles.rowGrow}>{env.name}</span>
            {env.is_active && <span className={styles.checkmark}>✓</span>}
          </button>
        ))}
    </div>
  );
}
