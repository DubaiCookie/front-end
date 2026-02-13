import clsx from "clsx";
import MenuListItem from "./MenuListItem";
import styles from "./Menu.module.css";

type MenuActionItem = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

type MenuListProps = {
  items: MenuActionItem[];
  className?: string;
};

export default function MenuList({ items, className }: MenuListProps) {
  return (
    <nav className={clsx(styles.menuList, className)} aria-label="my page menu">
      {items.map((item, index) => (
        <MenuListItem
          key={item.label}
          label={item.label}
          onClick={item.onClick}
          disabled={item.disabled}
          showDivider={index < items.length - 1}
        />
      ))}
    </nav>
  );
}
