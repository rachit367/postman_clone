"use client";

import { useState } from "react";

import { createCollection, saveRequest, updateRequest } from "@/store/slices/collectionsSlice";
import { fetchHistory } from "@/store/slices/historySlice";
import { closeModal, pushToast } from "@/store/slices/uiSlice";
import { markSaved } from "@/store/slices/tabsSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

import { Dropdown } from "./Dropdown";
import { EnvironmentManager } from "./sidebar/EnvironmentManager";
import styles from "./workspace.module.css";

export function Modals() {
  const dispatch = useAppDispatch();
  const modal = useAppSelector((s) => s.ui.modal);
  const collections = useAppSelector((s) => s.collections.items);
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
                await dispatch(createCollection(name.trim()));
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
                if (!collectionId) {
                  return;
                }
                const request = {
                  ...activeTab.draft,
                  name: name || activeTab.draft.name,
                };
                if (activeTab.requestId) {
                  await dispatch(
                    updateRequest({ id: activeTab.requestId, request })
                  );
                } else {
                  const result = await dispatch(
                    saveRequest({ collectionId, request })
                  ).unwrap();
                  dispatch(
                    markSaved({
                      requestId: result.created.id,
                      collectionId: result.created.collection_id,
                      name: result.created.name,
                    })
                  );
                }
                dispatch(fetchHistory());
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
