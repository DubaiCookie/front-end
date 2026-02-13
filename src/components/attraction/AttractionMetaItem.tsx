import styles from "./AttractionMetaItem.module.css";

type AttractionMetaItemProps = {
  label: string;
  value: string;
};

export default function AttractionMetaItem({ label, value }: AttractionMetaItemProps) {
  return (
    <div className={styles.metaItem}>
      <p className={styles.metaLabel}>{label}</p>
      <p className={styles.metaValue}>{value}</p>
    </div>
  );
}
