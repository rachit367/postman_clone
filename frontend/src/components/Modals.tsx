"use client";

import { useState } from "react";

import { createCollection, saveRequest, updateRequest } from "@/store/slices/collectionsSlice";
import { closeModal, pushToast } from "@/store/slices/uiSlice";
import { createWorkspace, renameWorkspace } from "@/store/slices/workspacesSlice";
import { markSaved } from "@/store/slices/tabsSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

import { Dropdown } from "./Dropdown";
import { EnvironmentManager } from "./sidebar/EnvironmentManager";
import styles from "./workspace.module.css";

export function Modals() {
  const dispatch = useAppDispatch();
  const modal = useAppSelector((s) => s.ui.modal);
  const collections = useAppSelector((s) => s.collections.items);
  const workspaceId = useAppSelector((s) => s.workspaces.selectedId);
  const activeTab = useAppSelector((s) =>
    s.tabs.tabs.find((t) => t.id === s.tabs.activeTabId)
  );

  const [name, setName] = useState("");
  const [targetCollection, setTargetCollection] = useState<number | null>(null);

  if (!modal) {
    return null;
  }

  const close = () => {
    setName("");
    dispatch(closeModal());
  };

  if (modal.type === "workspace-create" || modal.type === "workspace-rename") {
    const isRename = modal.type === "workspace-rename";
    return (
      <div className={styles.modalOverlay} onClick={close}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalTitle}>
            {isRename ? "Rename Workspace" : "New Workspace"}
          </div>
          <input
            autoFocus
            className={styles.textInput}
            placeholder="Workspace name"
            value={name || (isRename ? modal.name : "")}
            onChange={(e) => setName(e.target.value)}
          />
          <div className={styles.modalActions}>
            <button className={styles.btnGhost} onClick={close}>
              Cancel
            </button>
            <button
              className={styles.btnPrimary}
              onClick={async () => {
                const value = name.trim() || (isRename ? modal.name : "");
                if (!value) {
                  return;
                }
                if (isRename) {
                  await dispatch(renameWorkspace({ id: modal.id, name: value }));
                } else {
                  await dispatch(createWorkspace(value));
                }
                dispatch(pushToast("Workspace saved", "success"));
                close();
              }}
            >
              {isRename ? "Rename" : "Create"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (modal.type === "coming-soon") {
    return (
      <div className={styles.modalOverlay} onClick={close}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalTitle}>{modal.title}</div>
          <p className={styles.homeHint}>Coming Soon</p>
          <div className={styles.modalActions}>
            <button className={styles.btnGhost} onClick={close}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (modal.type === "environment-manager") {
    return (
      <div className={styles.modalOverlay} onClick={close}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <EnvironmentManager onClose={close} />
        </div>
      </div>
    );
  }

  if (modal.type === "new-collection") {
    return (
      <div className={styles.modalOverlay} onClick={close}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalTitle}>New Collection</div>
          <input
            autoFocus
            className={styles.textInput}
            placeholder="Collection name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className={styles.modalActions}>
            <button className={styles.btnGhost} onClick={close}>
              Cancel
            </button>
            <button
              className={styles.btnPrimary}
              onClick={async () => {
                if (!name.trim()) {
                  return;
                }
                if (!workspaceId) {
                  return;
                }
                await dispatch(createCollection({ workspaceId, name: name.trim() }));
                dispatch(pushToast("Collection created", "success"));
                close();
              }}
            >
              Create
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (modal.type === "save-request" && activeTab) {
    const collectionId = targetCollection ?? activeTab.collectionId ?? collections[0]?.id ?? null;
    return (
      <div className={styles.modalOverlay} onClick={close}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalTitle}>Save Request</div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Request name</label>
            <input
              autoFocus
              className={styles.textInput}
              value={name || activeTab.draft.name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Collection</label>
            <Dropdown
              value={String(collectionId ?? "")}
              options={collections.map((c) => ({ value: String(c.id), label: c.name }))}
              onChange={(v) => setTargetCollection(Number(v))}
              minWidth={200}
            />
          </div>
          <div className={styles.modalActions}>
            <button className={styles.btnGhost} onClick={close}>
              Cancel
            </button>
            <button
              className={styles.btnPrimary}
              disabled={!collectionId}
              onClick={async () => {
                if (!collectionId || !workspaceId) {
                  return;
                }
                const request = {
                  ...activeTab.draft,
                  name: name || activeTab.draft.name,
                };
                if (activeTab.requestId) {
                  await dispatch(
                    updateRequest({ id: activeTab.requestId, request, workspaceId })
                  );
                } else {
                  const result = await dispatch(
                    saveRequest({ collectionId, request, workspaceId })
                  ).unwrap();
                  dispatch(
                    markSaved({
                      requestId: result.created.id,
                      collectionId: result.created.collection_id,
                      name: result.created.name,
                    })
                  );
                }
                dispatch(pushToast("Request saved", "success"));
                close();
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
