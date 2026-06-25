"use client";

import { useEffect } from "react";

import { dismissToast } from "@/store/slices/uiSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

import styles from "./workspace.module.css";

const KIND_CLASS = {
  success: styles.toastSuccess,
  error: styles.toastError,
  info: styles.toastInfo,
};

export function Toasts() {
  const dispatch = useAppDispatch();
  const toasts = useAppSelector((s) => s.ui.toasts);

  useEffect(() => {
    if (toasts.length === 0) {
      return;
    }
    const timers = toasts.map((toast) =>
      setTimeout(() => dispatch(dismissToast(toast.id)), 3000)
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts, dispatch]);

  return (
    <div className={styles.toasts}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${styles.toast} ${KIND_CLASS[toast.kind]}`}
          onClick={() => dispatch(dismissToast(toast.id))}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
