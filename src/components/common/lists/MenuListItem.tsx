import clsx from "clsx";
import styles from "./Menu.module.css";

type MenuListItemProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  showDivider?: boolean;
};

export default function MenuListItem({
  label,
  onClick,
  disabled = false,
  showDivider = false,
}: MenuListItemProps) {
  return (
    <div className={styles.menuItemWrap}>
      <button
        type="button"
        className={clsx(styles.menuItem, disabled && styles.disabled)}
        onClick={onClick}
        disabled={disabled}
      >
        {label}
      </button>
      {showDivider && <div className={styles.menuDivider} />}
    </div>
  );
}
