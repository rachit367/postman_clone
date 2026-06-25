"use client";

import { activateEnvironment } from "@/store/slices/environmentsSlice";
import { openModal } from "@/store/slices/uiSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

import styles from "../workspace.module.css";

export function EnvironmentsSection() {
  const dispatch = useAppDispatch();
  const environments = useAppSelector((s) => s.environments.items);

  return (
    <div>
      <div className={styles.sectionHeader}>
        Environments
        <button
          className={styles.miniButton}
          style={{ marginLeft: "auto" }}
          title="Manage environments"
          onClick={() => dispatch(openModal({ type: "environment-manager" }))}
        >
          +
        </button>
      </div>
      {environments.map((env) => (
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
