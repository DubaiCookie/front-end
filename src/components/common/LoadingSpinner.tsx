import { useEffect } from "react";
import styles from "./LoadingSpinner.css.module.css";

type LoadingSpinnerProps = {
  isLoading: boolean;
  message?: string;
};

export default function LoadingSpinner({
  isLoading,
  message = "처리 중입니다...",
}: LoadingSpinnerProps) {
  useEffect(() => {
    if (!isLoading) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isLoading]);

  if (!isLoading) {
    return null;
  }

  return (
    <div className={styles.overlay} role="status" aria-live="polite" aria-busy="true">
      <div className={styles.content}>
        <div className={styles.spinner} />
        <p className={styles.message}>{message}</p>
      </div>
    </div>
  );
}
