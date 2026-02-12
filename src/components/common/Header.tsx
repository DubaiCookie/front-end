import clsx from 'clsx';
import styles from '@/components/common/Header.module.css';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo/tmp1.png';
import { useAuthStore } from "@/stores/auth.store";
import { IoNotifications } from "react-icons/io5";
import { FiLogIn } from "react-icons/fi";

export default function Header() {
    // const token = useAuthStore((s) => s.accessToken); // 로그인 구현 후 수정
    const token = 1;
    const logout = useAuthStore((s) => s.logout);

    return (
        <header className={clsx(styles.root, 'container', 'flex-row')}>
            {/* <img src={logo} alt="WayThing logo" className={clsx(styles.logo)} /> */}
            <Link to="/attraction">로고</Link>
            <div className={clsx('highlight', 'flex-row')}>
                {token ? (
                    <>
                        <p className={clsx(styles.headerText, 'flex-row', 'glass')}>
                            <span className={clsx(styles.userName)}>이름</span>
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