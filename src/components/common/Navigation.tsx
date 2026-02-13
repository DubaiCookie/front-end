import styles from './Navigation.module.css';
import clsx from 'clsx';
import { NavLink } from 'react-router-dom';
import { MdAttractions } from "react-icons/md";
import { IoTicket, IoHourglass } from "react-icons/io5";
import { FaUserCircle } from "react-icons/fa";

export default function Navigation() {
  return (
    <div className={clsx(styles.root, 'flex-row')}>
      <NavLink to="/attraction" className={({ isActive }) => clsx('flex-row', styles.navLink, isActive && styles.active)}>
        <MdAttractions className={clsx(styles.icon)} />
      </NavLink>
      <NavLink to="/ticket" className={({ isActive }) => clsx('flex-row', styles.navLink, isActive && styles.active)}>
        <IoTicket className={clsx(styles.icon)} />
      </NavLink>
      <NavLink to="/waiting" className={({ isActive }) => clsx('flex-row', styles.navLink, isActive && styles.active)}>
        <IoHourglass className={clsx(styles.icon)} />
      </NavLink>
      <NavLink to="/mypage" className={({ isActive }) => clsx('flex-row', styles.navLink, isActive && styles.active)}>
        <FaUserCircle className={clsx(styles.icon)} />
      </NavLink>
    </div>
  );
}
