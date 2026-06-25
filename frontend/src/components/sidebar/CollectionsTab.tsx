"use client";

import { useState } from "react";

import {
  createFolder,
  deleteCollection,
  deleteRequest,
  renameCollection,
} from "@/store/slices/collectionsSlice";
import { openRequestInTab } from "@/store/slices/tabsSlice";
import { pushToast } from "@/store/slices/uiSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { ApiRequest, Collection, Folder } from "@/types";

import styles from "../workspace.module.css";

function RequestRow({ request, indent }: { request: ApiRequest; indent: string }) {
  const dispatch = useAppDispatch();
  return (
    <button
      className={`${styles.treeRow} ${indent}`}
      onClick={() => dispatch(openRequestInTab(request))}
    >
      <span className={`${styles.methodTag} method-${request.method.toLowerCase()}`}>
        {request.method}
      </span>
      <span className={styles.rowGrow}>{request.name}</span>
      <span className={styles.rowActions}>
        <button
          className={styles.miniButton}
          title="Delete request"
          onClick={(e) => {
            e.stopPropagation();
            dispatch(deleteRequest(request.id));
            dispatch(pushToast("Request deleted", "info"));
          }}
        >
          ✕
        </button>
      </span>
    </button>
  );
}

function FolderRow({ folder }: { folder: Folder }) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button className={`${styles.treeRow} ${styles.treeIndent1}`} onClick={() => setOpen(!open)}>
        <span>{open ? "▾" : "▸"}</span>
        <span className={styles.rowGrow}>📁 {folder.name}</span>
      </button>
      {open &&
        folder.requests.map((request) => (
          <RequestRow key={request.id} request={request} indent={styles.treeIndent2} />
        ))}
    </div>
  );
}

function CollectionRow({ collection }: { collection: Collection }) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(true);

  return (
    <div>
      <button className={styles.treeRow} onClick={() => setOpen(!open)}>
        <span>{open ? "▾" : "▸"}</span>
        <span className={styles.rowGrow}>{collection.name}</span>
        <span className={styles.rowActions}>
          <button
            className={styles.miniButton}
            title="Add folder"
            onClick={(e) => {
              e.stopPropagation();
              const name = prompt("Folder name");
              if (name) {
                dispatch(createFolder({ collectionId: collection.id, name }));
              }
            }}
          >
            +
          </button>
          <button
            className={styles.miniButton}
            title="Rename"
            onClick={(e) => {
              e.stopPropagation();
              const name = prompt("Rename collection", collection.name);
              if (name) {
                dispatch(renameCollection({ id: collection.id, name }));
              }
            }}
          >
            ✎
          </button>
          <button
            className={styles.miniButton}
            title="Delete"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Delete collection "${collection.name}"?`)) {
                dispatch(deleteCollection(collection.id));
                dispatch(pushToast("Collection deleted", "info"));
              }
            }}
          >
            ✕
          </button>
        </span>
      </button>
      {open && (
        <div>
          {collection.folders.map((folder) => (
            <FolderRow key={folder.id} folder={folder} />
          ))}
          {collection.requests.map((request) => (
            <RequestRow key={request.id} request={request} indent={styles.treeIndent1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function CollectionsTab({ search }: { search: string }) {
  const collections = useAppSelector((s) => s.collections.items);
  const query = search.toLowerCase();
  const matchesRequest = (collection: Collection) =>
    collection.requests.some((r) => r.name.toLowerCase().includes(query)) ||
    collection.folders.some((f) =>
      f.requests.some((r) => r.name.toLowerCase().includes(query))
    );
  const filtered = collections.filter(
    (c) => c.name.toLowerCase().includes(query) || matchesRequest(c)
  );

  return (
    <div>
      <div className={styles.sectionHeader}>Collections</div>
      {filtered.map((collection) => (
        <CollectionRow key={collection.id} collection={collection} />
      ))}
    </div>
  );
}
