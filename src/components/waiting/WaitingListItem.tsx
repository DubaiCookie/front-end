import clsx from "clsx";
import type { QueueStatusItem } from "@/types/queue";
import styles from "./Waiting.module.css";

type WaitingListItemProps = {
  item: QueueStatusItem;
  onCancel?: (item: QueueStatusItem) => void;
  onSnooze?: (item: QueueStatusItem) => void;
  onBoard?: (item: QueueStatusItem) => void;
};

export default function WaitingListItem({ item, onCancel, onSnooze, onBoard }: WaitingListItemProps) {
  const ticketTypeLabel = item.ticketType === "PREMIUM" ? "Premium" : "Basic";
  const isAvailable = item.status === "AVAILABLE";
  const canSnooze = item.deferCount < 3;

  return (
    <article className={clsx(styles.item, isAvailable && styles.itemAvailable)}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.liveBadge}>
            <span className={styles.liveDot} />
            <span className={styles.rideName}>{item.attractionName}</span>
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
        <span className={styles.summaryLabel}>상태</span>
        <span className={styles.summaryValue}>{isAvailable ? "탑승 가능" : "대기 중"}</span>
        <span className={styles.summaryDot}>•</span>
        {isAvailable ? (
          <span className={styles.summaryValue}>지금 탑승구로 이동해주세요</span>
        ) : (
          <>
            <span className={styles.summaryLabel}>내 순서</span>
            <span className={styles.summaryValue}>{item.position}번째</span>
            <span className={styles.summaryDot}>•</span>
            <span className={styles.summaryLabel}>예상 대기시간</span>
            <span className={styles.summaryValue}>{item.estimatedMinutes}분</span>
          </>
        )}
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
        {canSnooze ? (
          <button
            type="button"
            className={styles.snoozeButton}
            onClick={() => {
              onSnooze?.(item);
            }}
          >
            미루기
          </button>
        ) : null}
        {isAvailable ? (
          <>
            <button
              type="button"
              className={styles.boardButton}
              onClick={() => {
                onBoard?.(item);
              }}
            >
              탑승
            </button>
          </>
        ) : null}
      </div>
    </article>
  );
}
