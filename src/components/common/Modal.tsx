import type { ComponentPropsWithoutRef, ReactNode } from "react";
import clsx from "clsx";
import styles from "./Modal.module.css";

type ModalProps = ComponentPropsWithoutRef<"div"> & {
  isOpen: boolean;
  title: string;
  content: ReactNode;
  buttonTitle: string;
  onButtonClick: () => void;
};

export default function Modal({
  isOpen,
  title,
  content,
  buttonTitle,
  onButtonClick,
  className,
  ...rest
}: ModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div className={clsx(styles.modal, className)} role="dialog" aria-modal="true" {...rest}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.content}>{content}</div>
        <button type="button" className={styles.button} onClick={onButtonClick}>
          {buttonTitle}
        </button>
      </div>
    </div>
  );
}
