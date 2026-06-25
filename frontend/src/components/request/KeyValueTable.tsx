"use client";

import { KeyValue } from "@/types";

import styles from "../workspace.module.css";

interface Props {
  rows: KeyValue[];
  onChange: (rows: KeyValue[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}

function emptyRow(): KeyValue {
  return { key: "", value: "", enabled: true };
}

export function KeyValueTable({
  rows,
  onChange,
  keyPlaceholder = "Key",
  valuePlaceholder = "Value",
}: Props) {
  const isLast = (index: number) => index === rows.length - 1;
  const isBlank = (row: KeyValue) => !row.key && !row.value;

  const update = (index: number, patch: Partial<KeyValue>) => {
    const next = rows.map((row, i) => (i === index ? { ...row, ...patch } : row));
    const last = next[next.length - 1];
    if (last && (last.key || last.value)) {
      next.push(emptyRow());
    }
    onChange(next);
  };

  const remove = (index: number) => {
    const next = rows.filter((_, i) => i !== index);
    onChange(next.length ? next : [emptyRow()]);
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
        {rows.map((row, index) => {
          const draftRow = isLast(index) && isBlank(row);
          return (
            <tr key={index}>
              <td className={styles.kvCheck}>
                <input
                  type="checkbox"
                  className={styles.kvCheckbox}
                  checked={draftRow ? false : row.enabled}
                  disabled={draftRow}
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
                {!draftRow && (
                  <button className={styles.miniButton} onClick={() => remove(index)}>
                    ✕
                  </button>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
