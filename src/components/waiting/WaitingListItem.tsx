import clsx from "clsx";
import type { QueueStatusItem } from "@/types/queue";
import styles from "./Waiting.module.css";

type WaitingListItemProps = {
  item: QueueStatusItem;
};

export default function WaitingListItem({ item }: WaitingListItemProps) {
  const ticketTypeLabel = item.ticketType === "PREMIUM" ? "Premium" : "Basic";

  return (
    <article className={styles.item}>
      <header className={styles.header}>
        <p className={styles.rideName}>{item.rideName}</p>
        <span
          className={clsx(
            styles.ticketTypeBadge,
            item.ticketType === "PREMIUM" ? styles.ticketTypePremium : styles.ticketTypeBasic,
          )}
        >
          {ticketTypeLabel}
        </span>
      </header>

      <div className={styles.infoRow}>
        <span className={styles.infoLabel}>내 순서</span>
        <span className={styles.infoValue}>{item.position}번째</span>
      </div>
      <div className={styles.infoRow}>
        <span className={styles.infoLabel}>예상 대기시간</span>
        <span className={styles.infoValue}>{item.estimatedWaitMinutes}분</span>
      </div>
    </article>
  );
}
