import clsx from 'clsx';
import styles from '@/components/common/Header.module.css';
import { Link } from 'react-router-dom';
import { useAuthStore } from "@/stores/auth.store";
import { IoNotifications } from "react-icons/io5";
import { FiLogIn } from "react-icons/fi";

export default function Header() {
    const username = useAuthStore((s) => s.username);
    const isLoggedIn = Boolean(username);

    return (
        <header className={clsx(styles.root, 'container', 'flex-row')}>
            <Link to="/attraction">
                로고
            </Link>
            <div className={clsx('highlight', 'flex-row')}>
                {isLoggedIn ? (
                    <>
                        <p className={clsx(styles.headerText, 'flex-row', 'glass')}>
                            <span className={clsx(styles.userName)}>{username}</span>
                            <span>님</span>
                        </p>
                        <IoNotifications className={clsx(styles.icon)} />
                    </>)
                    : (<>
                        <Link to="/login" className={clsx('flex-row', styles.headerText)}>
                            <p className={clsx(styles.smallText)}>로그인</p>
                            <FiLogIn className={clsx(styles.icon)} />
                        </Link>
                    </>)}
            </div>
        </header>
    );
}
