"use client";

import { activateEnvironment } from "@/store/slices/environmentsSlice";
import { openModal } from "@/store/slices/uiSlice";
import { setShowHome } from "@/store/slices/tabsSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

import styles from "./workspace.module.css";

const NAV_ITEMS = ["Docs", "Updates", "Apps", "Settings"];

export function TopBar() {
  const dispatch = useAppDispatch();
  const environments = useAppSelector((s) => s.environments.items);
  const activeId = environments.find((e) => e.is_active)?.id ?? 0;

  return (
    <div className={styles.topbar}>
      <button className={styles.topbarBrand} onClick={() => dispatch(setShowHome(true))}>
        My Workspace
      </button>
      <nav className={styles.topbarNav}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item}
            className={styles.topbarNavItem}
            onClick={() =>
              dispatch(openModal({ type: "coming-soon", title: item }))
            }
          >
            {item}
          </button>
        ))}
      </nav>
      <div className={styles.topbarSpacer} />
      <select
        className={styles.envSelect}
        value={activeId}
        onChange={(e) => {
          const id = Number(e.target.value);
          if (id) {
            dispatch(activateEnvironment(id));
          }
        }}
      >
        <option value={0}>No Environment</option>
        {environments.map((env) => (
          <option key={env.id} value={env.id}>
            {env.name}
          </option>
        ))}
      </select>
    </div>
  );
}
