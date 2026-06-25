"use client";

import { useEffect, useRef, useState } from "react";

import { activateEnvironment } from "@/store/slices/environmentsSlice";
import { openModal } from "@/store/slices/uiSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

import styles from "./workspace.module.css";

export function EnvironmentSelector() {
  const dispatch = useAppDispatch();
  const environments = useAppSelector((s) => s.environments.items);
  const active = environments.find((e) => e.is_active);

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const filtered = environments.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.envSelector} ref={ref}>
      <button className={styles.envTrigger} onClick={() => setOpen(!open)}>
        {active ? active.name : "No Environment"} ▾
      </button>
      {open && (
        <div className={styles.envPanel}>
          <div className={styles.envPanelHeader}>
            <input
              autoFocus
              className={styles.envSearchInput}
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              className={styles.miniButton}
              title="Add environment"
              onClick={() => {
                setOpen(false);
                dispatch(openModal({ type: "environment-manager" }));
              }}
            >
              +
            </button>
          </div>
          <button
            className={`${styles.envOption} ${styles.envOptionMuted}`}
            onClick={() => {
              if (active) {
                dispatch(activateEnvironment(active.id));
              }
              setOpen(false);
            }}
          >
            <span className={styles.envCheck}></span>
            No environment
          </button>
          {filtered.map((env) => (
            <button
              key={env.id}
              className={`${styles.envOption} ${env.is_active ? styles.envOptionActive : ""}`}
              onClick={() => {
                dispatch(activateEnvironment(env.id));
                setOpen(false);
              }}
            >
              <span className={styles.envCheck}>{env.is_active ? "✓" : ""}</span>
              {env.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
