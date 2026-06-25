"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./workspace.module.css";

export interface DropdownOption {
  value: string;
  label: string;
  className?: string;
}

interface Props {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  triggerClassName?: string;
  panelAlign?: "left" | "right";
  minWidth?: number;
}

export function Dropdown({
  value,
  options,
  onChange,
  triggerClassName,
  panelAlign = "left",
  minWidth = 140,
}: Props) {
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

  const selected = options.find((o) => o.value === value);

  return (
    <div className={styles.dropdown} ref={ref}>
      <button
        type="button"
        className={`${styles.dropdownTrigger} ${triggerClassName ?? ""}`}
        onClick={() => setOpen(!open)}
      >
        <span className={selected?.className}>{selected?.label ?? value}</span>
        <span className={styles.dropdownCaret}>▾</span>
      </button>
      {open && (
        <div
          className={styles.dropdownPanel}
          style={{ minWidth, [panelAlign]: 0 }}
        >
          {options.map((option) => (
            <button
              type="button"
              key={option.value}
              className={`${styles.dropdownItem} ${option.value === value ? styles.dropdownItemActive : ""}`}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              <span className={option.className}>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
