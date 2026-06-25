"use client";

import { activateEnvironment } from "@/store/slices/environmentsSlice";
import { openModal, pushToast } from "@/store/slices/uiSlice";
import { setShowHome } from "@/store/slices/tabsSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

import { StubBadge } from "./StubBadge";
import styles from "./workspace.module.css";

export function TopBar() {
  const dispatch = useAppDispatch();
  const environments = useAppSelector((s) => s.environments.items);
  const activeId = environments.find((e) => e.is_active)?.id ?? 0;

  const comingSoon = (title: string) => dispatch(openModal({ type: "coming-soon", title }));

  return (
    <div className={styles.topbarWrap}>
      <div className={styles.topbar}>
        <div className={styles.topbarNavBtns}>
          <button className={styles.iconButton} title="Back" onClick={() => comingSoon("Back")}>
            ‹
          </button>
          <button className={styles.iconButton} title="Forward" onClick={() => comingSoon("Forward")}>
            ›
          </button>
          <button
            className={styles.iconButton}
            title="Home"
            onClick={() => dispatch(setShowHome(true))}
          >
            ⌂
          </button>
        </div>
        <button className={styles.workspaceMenu} onClick={() => dispatch(setShowHome(true))}>
          My Workspace ▾
        </button>

        <div className={styles.topbarSpacer} />
        <button className={styles.topbarSearch} onClick={() => comingSoon("Search")}>
          🔍 Search <StubBadge />
        </button>
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
        <button className={styles.btnGhost} onClick={() => comingSoon("Invite")}>
          Invite
        </button>
        <button className={styles.upgradeBtn} onClick={() => comingSoon("Upgrade")}>
          Upgrade
        </button>
        <button className={styles.iconButton} title="Notifications" onClick={() => comingSoon("Notifications")}>
          🔔
        </button>
        <button className={styles.iconButton} title="Settings" onClick={() => comingSoon("Settings")}>
          ⚙
        </button>
        <button className={styles.avatar} title="Account" onClick={() => comingSoon("Account")}>
          R
        </button>
      </div>
    </div>
  );
}
