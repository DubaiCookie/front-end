import styles from '@/components/common/Header.module.css';
import clsx from 'clsx';
import { useAuthStore } from "@/stores/auth.store";
import { FaRegUserCircle } from "react-icons/fa";

export default function Header() {
    // const token = useAuthStore((s) => s.accessToken); // 로그인 구현 후 수정
    const token = 1;
    const logout = useAuthStore((s) => s.logout);

    return (
        <header className={clsx(styles.root)}>
            <div className={clsx('container', 'flex-row')}>
                <div className={clsx(styles.logo)}>로고</div>
                {token ? (
                    <div className={clsx(styles.userInfo, 'flex-row')}>
                        <div className={clsx(styles.userText, 'flex-row')}>
                            <div className={clsx(styles.userName, 'highlight')}>이름</div>
                            <div>님 반갑습니다!</div>
                        </div>
                        <FaRegUserCircle className={clsx(styles.icon)} />
                    </div>)
                    : (<div>로그인</div>)}
            </div>
        </header>
    );
}