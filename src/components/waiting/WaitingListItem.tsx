import clsx from "clsx";
import type { QueueStatusItem } from "@/types/queue";
import styles from "./Waiting.module.css";

type WaitingListItemProps = {
  item: QueueStatusItem;
  onCancel?: (item: QueueStatusItem) => void;
  onSnooze?: (item: QueueStatusItem) => void;
};

export default function WaitingListItem({ item, onCancel, onSnooze }: WaitingListItemProps) {
  const ticketTypeLabel = item.ticketType === "PREMIUM" ? "Premium" : "Basic";

  return (
    <article className={styles.item}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.liveBadge}>
            <span className={styles.liveDot} />
            <span className={styles.rideName}>{item.rideName}</span>
          </span>
        </div>
        <span
          className={clsx(
            styles.ticketTypeBadge,
            item.ticketType === "PREMIUM" ? styles.ticketTypePremium : styles.ticketTypeBasic,
          )}
        >
          {ticketTypeLabel}
        </span>
      </header>

      <div className={styles.summaryRow}>
        <span className={styles.summaryLabel}>내 순서</span>
        <span className={styles.summaryValue}>{item.position}번째</span>
        <span className={styles.summaryDot}>•</span>
        <span className={styles.summaryLabel}>예상 대기시간</span>
        <span className={styles.summaryValue}>{item.estimatedWaitMinutes}분</span>
      </div>

      <div className={styles.actionRow}>
        <button
          type="button"
          className={styles.cancelButton}
          onClick={() => {
            onCancel?.(item);
          }}
        >
          취소
        </button>
        <button
          type="button"
          className={styles.snoozeButton}
          onClick={() => {
            onSnooze?.(item);
          }}
        >
          미루기
        </button>
      </div>
    </article>
  );
}
