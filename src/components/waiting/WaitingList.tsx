import type { QueueStatusItem } from "@/types/queue";
import WaitingListItem from "./WaitingListItem";
import styles from "./Waiting.module.css";

type WaitingListProps = {
  items: QueueStatusItem[];
  onCancel?: (item: QueueStatusItem) => void;
};

export default function WaitingList({ items, onCancel }: WaitingListProps) {
  return (
    <div className={styles.list}>
      {items.map((item) => (
        <WaitingListItem key={`${item.rideId}-${item.ticketType}`} item={item} onCancel={onCancel} />
      ))}
    </div>
  );
}
