"use client";

import { useEffect, useRef, useState } from "react";

import {
  deleteWorkspace,
  selectWorkspace,
} from "@/store/slices/workspacesSlice";
import { openModal, pushToast } from "@/store/slices/uiSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

import styles from "./workspace.module.css";

export function WorkspaceSwitcher() {
  const dispatch = useAppDispatch();
  const workspaces = useAppSelector((s) => s.workspaces.items);
  const selectedId = useAppSelector((s) => s.workspaces.selectedId);
  const selected = workspaces.find((w) => w.id === selectedId);

  const [open, setOpen] = useState(false);
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

  const onDelete = async (id: number, name: string) => {
    if (!confirm(`Delete workspace "${name}"? This removes its collections, environments and history.`)) {
      return;
    }
    try {
      await dispatch(deleteWorkspace(id)).unwrap();
      dispatch(pushToast("Workspace deleted", "info"));
    } catch (err) {
      dispatch(pushToast((err as Error).message || "Could not delete workspace", "error"));
    }
  };

  return (
    <div className={styles.dropdown} ref={ref}>
      <button className={styles.workspaceMenu} onClick={() => setOpen(!open)}>
        {selected ? selected.name : "Workspace"} ▾
      </button>
      {open && (
        <div className={styles.dropdownPanel} style={{ minWidth: 240, left: 0 }}>
          {workspaces.map((ws) => (
            <div
              key={ws.id}
              className={`${styles.envOption} ${ws.id === selectedId ? styles.envOptionActive : ""}`}
            >
              <span
                className={styles.envCheck}
                onClick={() => {
                  dispatch(selectWorkspace(ws.id));
                  setOpen(false);
                }}
                role="button"
              >
                {ws.id === selectedId ? "✓" : ""}
              </span>
              <span
                className={styles.rowGrow}
                role="button"
                onClick={() => {
                  dispatch(selectWorkspace(ws.id));
                  setOpen(false);
                }}
              >
                {ws.name}
              </span>
              <span className={styles.rowActions} style={{ display: "flex" }}>
                <button
                  className={styles.miniButton}
                  title="Rename"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(false);
                    dispatch(openModal({ type: "workspace-rename", id: ws.id, name: ws.name }));
                  }}
                >
                  ✎
                </button>
                <button
                  className={styles.miniButton}
                  title="Delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(ws.id, ws.name);
                  }}
                >
                  ✕
                </button>
              </span>
            </div>
          ))}
          <button
            className={`${styles.envOption} ${styles.envOptionMuted}`}
            onClick={() => {
              setOpen(false);
              dispatch(openModal({ type: "workspace-create" }));
            }}
          >
            <span className={styles.envCheck}>+</span>
            Create Workspace
          </button>
        </div>
      )}
    </div>
  );
}
