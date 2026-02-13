import styles from './Navigation.module.css';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { MdAttractions } from "react-icons/md";
import { IoTicket, IoHourglass } from "react-icons/io5";
import { FaUserCircle } from "react-icons/fa";

export default function Navigation() {
  return (
    <div className={clsx(styles.root, 'flex-row')}>
      <Link to="/attraction" className={clsx('flex-row')}>
        <MdAttractions className={clsx(styles.icon)} />
      </Link>
      <Link to="/ticket" className={clsx('flex-row')}>
        <IoTicket className={clsx(styles.icon)} />
      </Link>
      <Link to="/waiting" className={clsx('flex-row')}>
        <IoHourglass className={clsx(styles.icon)} />
      </Link>
      <Link to="/mypage" className={clsx('flex-row')}>
        <FaUserCircle className={clsx(styles.icon)} />
      </Link>
    </div>
  );
}