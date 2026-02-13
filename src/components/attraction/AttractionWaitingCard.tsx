import clsx from "clsx";
import styles from "./AttractionWaitingCard.module.css";

type AttractionWaitingCardProps = {
  typeLabel: "Premium" | "Basic";
  minutes: number;
  waitingCount: number;
};

export default function AttractionWaitingCard({
  typeLabel,
  minutes,
  waitingCount,
}: AttractionWaitingCardProps) {
  const variantClass = typeLabel === "Premium" ? styles.premiumCard : styles.generalCard;

  return (
    <div className={clsx(styles.waitingCard, variantClass)}>
      <p className={styles.waitingType}>{typeLabel}</p>
      <p className={styles.waitingTime}>{minutes} 분</p>
      <p className={styles.waitingCount}>대기 {waitingCount} 명</p>
    </div>
  );
}
