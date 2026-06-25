"use client";

import { useState } from "react";

import { api } from "@/lib/api";
import {
  createEnvironment,
  deleteEnvironment,
  updateEnvironment,
} from "@/store/slices/environmentsSlice";
import { pushToast } from "@/store/slices/uiSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

import { Dropdown } from "../Dropdown";
import styles from "../workspace.module.css";

interface EditableVar {
  id: number | null;
  key: string;
  value: string;
  is_secret: boolean;
  enabled: boolean;
  revealed: boolean;
}

function blankVar(): EditableVar {
  return { id: null, key: "", value: "", is_secret: false, enabled: true, revealed: false };
}

export function EnvironmentManager({ onClose }: { onClose: () => void }) {
  const dispatch = useAppDispatch();
  const environments = useAppSelector((s) => s.environments.items);
  const workspaceId = useAppSelector((s) => s.workspaces.selectedId);

  const [selectedId, setSelectedId] = useState<number | "new">(
    environments[0]?.id ?? "new"
  );

  const selected = environments.find((e) => e.id === selectedId);
  const [name, setName] = useState(selected?.name ?? "");
  const [vars, setVars] = useState<EditableVar[]>(() => {
    const base = (selected?.variables ?? []).map((v) => ({
      id: v.id,
      key: v.key,
      value: v.value,
      is_secret: v.is_secret,
      enabled: v.enabled,
      revealed: false,
    }));
    return [...base, blankVar()];
  });

  const loadEnv = (id: number | "new") => {
    setSelectedId(id);
    const env = environments.find((e) => e.id === id);
    setName(env?.name ?? "");
    const base = (env?.variables ?? []).map((v) => ({
      id: v.id,
      key: v.key,
      value: v.value,
      is_secret: v.is_secret,
      enabled: v.enabled,
      revealed: false,
    }));
    setVars([...base, blankVar()]);
  };

  const updateVar = (index: number, patch: Partial<EditableVar>) => {
    setVars((prev) => {
      const next = prev.map((v, i) => (i === index ? { ...v, ...patch } : v));
      const last = next[next.length - 1];
      if (last.key || last.value) {
        next.push(blankVar());
      }
      return next;
    });
  };

  const toggleReveal = async (index: number) => {
    const variable = vars[index];
    if (variable.revealed || !variable.is_secret || variable.id === null) {
      updateVar(index, { revealed: !variable.revealed });
      return;
    }
    try {
      const data = await api.get<{ value: string }>(`/variables/${variable.id}/reveal`);
      updateVar(index, { value: data.value, revealed: true });
    } catch {
      dispatch(pushToast("Could not reveal value", "error"));
    }
  };

  const save = async () => {
    const payload = vars
      .filter((v) => v.key)
      .map((v) => ({
        key: v.key,
        value: v.value,
        is_secret: v.is_secret,
        enabled: v.enabled,
      }));
    if (selectedId === "new") {
      if (!workspaceId) {
        return;
      }
      await dispatch(
        createEnvironment({ workspaceId, name: name || "New Environment", variables: payload })
      );
    } else {
      await dispatch(
        updateEnvironment({ id: selectedId, name: name || "Environment", variables: payload })
      );
    }
    dispatch(pushToast("Environment saved", "success"));
    onClose();
  };

  return (
    <div>
      <div className={styles.modalTitle}>Manage Environments</div>
      <div className={styles.field}>
        <Dropdown
          value={String(selectedId)}
          options={[
            ...environments.map((env) => ({ value: String(env.id), label: env.name })),
            { value: "new", label: "+ New environment" },
          ]}
          onChange={(v) => loadEnv(v === "new" ? "new" : Number(v))}
          minWidth={220}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.fieldLabel}>Name</label>
        <input
          className={styles.textInput}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <table className={styles.kvTable}>
        <thead>
          <tr>
            <th></th>
            <th>Variable</th>
            <th>Value</th>
            <th>Secret</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {vars.map((v, index) => (
            <tr key={index}>
              <td className={styles.kvCheck}>
                <input
                  type="checkbox"
                  checked={v.enabled}
                  onChange={(e) => updateVar(index, { enabled: e.target.checked })}
                />
              </td>
              <td>
                <input
                  className={styles.kvInput}
                  placeholder="key"
                  value={v.key}
                  onChange={(e) => updateVar(index, { key: e.target.value })}
                />
              </td>
              <td>
                <input
                  className={styles.kvInput}
                  type={v.is_secret && !v.revealed ? "password" : "text"}
                  placeholder="value"
                  value={v.value}
                  onChange={(e) => updateVar(index, { value: e.target.value, revealed: true })}
                />
              </td>
              <td className={styles.kvCheck}>
                <input
                  type="checkbox"
                  checked={v.is_secret}
                  onChange={(e) => updateVar(index, { is_secret: e.target.checked })}
                />
              </td>
              <td className={styles.kvDelete}>
                {v.is_secret && (
                  <button className={styles.miniButton} onClick={() => toggleReveal(index)}>
                    {v.revealed ? "🙈" : "👁"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.modalActions}>
        {selectedId !== "new" && (
          <button
            className={styles.btnGhost}
            onClick={async () => {
              await dispatch(deleteEnvironment(selectedId));
              dispatch(pushToast("Environment deleted", "info"));
              onClose();
            }}
          >
            Delete
          </button>
        )}
        <button className={styles.btnGhost} onClick={onClose}>
          Cancel
        </button>
        <button className={styles.btnPrimary} onClick={save}>
          Save
        </button>
      </div>
    </div>
  );
}
