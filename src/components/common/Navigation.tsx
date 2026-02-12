import styles from './Navigation.module.css';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { MdAttractions } from "react-icons/md";
import { IoTicket, IoHourglass } from "react-icons/io5";
import { FaUserCircle } from "react-icons/fa";

export default function Navigation() {
  return (
    <div className={clsx(styles.root, 'flex-row')}>
      <Link to="/attraction">
        <MdAttractions className={clsx(styles.icon)} />
      </Link>
      <Link to="/ticket">
        <IoTicket className={clsx(styles.icon)} />
      </Link>
      <Link to="/waiting-list">
        <IoHourglass className={clsx(styles.icon)} />
      </Link>
      <Link to="/mypage">
        <FaUserCircle className={clsx(styles.icon)} />
      </Link>
    </div>
  );
}