import clsx from "clsx";
import type { TicketKind } from "@/types/ticket";
import styles from "./TicketType.module.css";

type TicketTypeListItemProps = {
  type: TicketKind;
  title: string;
  description: string;
  priceLabel: string;
  selected: boolean;
  onSelect: (type: TicketKind) => void;
};

export default function TicketTypeListItem({
  type,
  title,
  description,
  priceLabel,
  selected,
  onSelect,
}: TicketTypeListItemProps) {
  return (
    <button
      type="button"
      className={clsx(styles.typeItem, selected && styles.selected)}
      onClick={() => onSelect(type)}
      aria-pressed={selected}
    >
      <div className={styles.topRow}>
        <span className={clsx(styles.badge, type === "PREMIUM" ? styles.premium : styles.general)}>{title}</span>
        <span className={styles.price}>{priceLabel}</span>
      </div>
      <p className={styles.description}>{description}</p>
    </button>
  );
}
