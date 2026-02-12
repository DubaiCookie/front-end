import clsx from "clsx";
import styles from "./user.module.css"
import InputForm from "@/components/common/inputs/InputForm";
import type { FieldSpec, LoginUser } from "@/types/user";
import { login } from "@/api/auth.api";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";


const loginFields: FieldSpec<'userId' | 'password'>[] = [
    {
        name: 'userId',
        label: 'ID',
        type: 'userId',
        placeholder: 'ID를 입력하세요.',
        autoComplete: 'username',
        required: true,
        validate: (v) => (v.length > 0 ? null : '사용자 ID를 입력해주세요.'),
    },
    {
        name: 'password',
        label: '비밀번호',
        type: 'password',
        placeholder: '비밀번호',
        autoComplete: 'current-password',
        required: true,
        validate: (v) => (v.length > 0 ? null : '비밀번호를 입력해주세요.'),
    },
];

export default function LoginPage() {
    const navigate = useNavigate();
    const setAuthUser = useAuthStore((state) => state.setAuthUser);

    const handleLogin = async (values: LoginUser) => {
        const response = await login(values);
        setAuthUser({
            userId: response.userId,
            username: response.username,
        });
        navigate("/attraction");
    };

    return (
        <div className={clsx('container', 'flex-column')}>
            <div className={clsx(styles.block, 'flex-column')}>
                <div className={clsx(styles.title, 'page-title')}>log in</div>
                <InputForm fields={loginFields} onSubmit={handleLogin} submitLabel="로그인" />
                <Link to="/signup" className={clsx(styles.smallText)}>회원이 아니신가요?</Link>
            </div>
        </div>
    );
}
