"use client";

import { blankRow } from "@/lib/defaults";
import { KeyValue } from "@/types";

import styles from "../workspace.module.css";

interface Props {
  rows: KeyValue[];
  onChange: (rows: KeyValue[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}

export function KeyValueTable({
  rows,
  onChange,
  keyPlaceholder = "Key",
  valuePlaceholder = "Value",
}: Props) {
  const update = (index: number, patch: Partial<KeyValue>) => {
    const next = rows.map((row, i) => (i === index ? { ...row, ...patch } : row));
    const last = next[next.length - 1];
    if (last && (last.key || last.value)) {
      next.push(blankRow());
    }
    onChange(next);
  };

  const remove = (index: number) => {
    const next = rows.filter((_, i) => i !== index);
    onChange(next.length ? next : [blankRow()]);
  };

  return (
    <table className={styles.kvTable}>
      <thead>
        <tr>
          <th className={styles.kvCheck}></th>
          <th>{keyPlaceholder}</th>
          <th>{valuePlaceholder}</th>
          <th className={styles.kvDelete}></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={index}>
            <td className={styles.kvCheck}>
              <input
                type="checkbox"
                checked={row.enabled}
                onChange={(e) => update(index, { enabled: e.target.checked })}
              />
            </td>
            <td>
              <input
                className={styles.kvInput}
                placeholder={keyPlaceholder}
                value={row.key}
                onChange={(e) => update(index, { key: e.target.value })}
              />
            </td>
            <td>
              <input
                className={styles.kvInput}
                placeholder={valuePlaceholder}
                value={row.value}
                onChange={(e) => update(index, { value: e.target.value })}
              />
            </td>
            <td className={styles.kvDelete}>
              {index < rows.length - 1 && (
                <button className={styles.miniButton} onClick={() => remove(index)}>
                  ✕
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
