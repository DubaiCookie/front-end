import type { ComponentPropsWithoutRef, ReactNode } from "react";
import clsx from "clsx";
import styles from "./Modal.module.css";

type ModalProps = Omit<ComponentPropsWithoutRef<"div">, "content"> & {
  isOpen: boolean;
  title: string;
  content: ReactNode;
  buttonTitle: string;
  onButtonClick: () => void;
  onClose?: () => void;
};

export default function Modal({
  isOpen,
  title,
  content,
  buttonTitle,
  onButtonClick,
  onClose,
  className,
  ...rest
}: ModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div className={clsx(styles.modal, className)} role="dialog" aria-modal="true" {...rest}>
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose ?? onButtonClick}
          aria-label="닫기"
        >
          ×
        </button>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.content}>{content}</div>
        <button type="button" className={styles.button} onClick={onButtonClick}>
          {buttonTitle}
        </button>
      </div>
    </div>
  );
}
