import clsx from "clsx";
import styles from "./LocationBadge.module.css";

type Props = {
  location: string;
  active?: boolean;
};

export default function LocationBadge({ location, active = false }: Props) {
  return (
    <div className={clsx(styles.badge, active && styles.badgeActive)}>
      <span className={styles.icon} aria-hidden="true">
        &#128205;
      </span>
      <span>{location}</span>
    </div>
  );
}
