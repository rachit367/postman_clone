"use client";

import { openModal } from "@/store/slices/uiSlice";
import { setShowHome } from "@/store/slices/tabsSlice";
import { useAppDispatch } from "@/store/hooks";

import { EnvironmentSelector } from "./EnvironmentSelector";
import styles from "./workspace.module.css";

export function TopBar() {
  const dispatch = useAppDispatch();

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

        <EnvironmentSelector />
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
