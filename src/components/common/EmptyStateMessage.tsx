import styles from "./EmptyStateMessage.module.css";

type EmptyStateMessageProps = {
  target: string;
};

export default function EmptyStateMessage({ target }: EmptyStateMessageProps) {
  return <p className={styles.root}>{target} 없습니다.</p>;
}
