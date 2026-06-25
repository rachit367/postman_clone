import styles from "./workspace.module.css";

export function StubBadge({ label = "stub" }: { label?: string }) {
  return <span className={styles.stub}>{label === "stub" ? "stub" : `${label} (stub)`}</span>;
}
