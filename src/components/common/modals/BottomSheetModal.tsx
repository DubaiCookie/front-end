import type { ReactNode } from "react";
import clsx from "clsx";
import styles from "./BottomSheetModal.module.css";

type BottomSheetModalProps = {
  isOpen: boolean;
  title?: string;
  children: ReactNode;
  onClose: () => void;
  className?: string;
};

export default function BottomSheetModal({
  isOpen,
  title,
  children,
  onClose,
  className,
}: BottomSheetModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay} role="presentation">
      <div className={clsx(styles.sheet, className)} role="dialog" aria-modal="true">
        <button
          type="button"
          className={styles.handleButton}
          onClick={onClose}
          aria-label="모달 닫기"
        >
          <span className={styles.handle} />
        </button>
        {title && <h2 className={styles.title}>{title}</h2>}
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
