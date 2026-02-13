import clsx from "clsx";
import styles from "./user.module.css"
import { useState } from "react";
import axios from "axios";
import InputForm from "@/components/common/inputs/InputForm";
import type { FieldSpec, LoginUser } from "@/types/user";
import { login } from "@/api/auth.api";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import Modal from "@/components/common/Modal";
import { getMyTicketList } from "@/api/ticket.api";
import { isSameLocalDate } from "@/utils/functions";


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
    const setTodayActiveTicket = useAuthStore((state) => state.setTodayActiveTicket);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isInvalidCredentialsModalOpen, setIsInvalidCredentialsModalOpen] = useState(false);

    const handleLogin = async (values: LoginUser) => {
        try {
            const response = await login(values);
            setAuthUser({
                userId: response.userId,
                username: response.username,
            });

            try {
                const ticketList = await getMyTicketList();
                const today = new Date();
                const availableTicket = ticketList.find(
                    (ticket) =>
                        ticket.activeStatus === "ACTIVE" &&
                        isSameLocalDate(new Date(ticket.availableAt), today),
                );

                setTodayActiveTicket({
                    hasTodayActiveTicket: Boolean(availableTicket),
                    todayActiveTicketType: availableTicket?.ticketType ?? null,
                });
            } catch (ticketError) {
                console.error(ticketError);
                setTodayActiveTicket({
                    hasTodayActiveTicket: false,
                    todayActiveTicketType: null,
                });
            }
            setIsSuccessModalOpen(true);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                setIsInvalidCredentialsModalOpen(true);
                return;
            }
            throw error;
        }
    };

    return (
        <>
            <Modal
                isOpen={isInvalidCredentialsModalOpen}
                title="로그인 실패"
                content="아이디/비밀번호를 확인해주세요."
                buttonTitle="확인"
                onButtonClick={() => {
                    setIsInvalidCredentialsModalOpen(false);
                }}
            />
            <Modal
                isOpen={isSuccessModalOpen}
                title="로그인 완료"
                content="로그인이 완료되었습니다."
                buttonTitle="확인"
                onButtonClick={() => {
                    setIsSuccessModalOpen(false);
                    navigate("/attraction");
                }}
            />
            <div className={clsx('container', 'flex-column')}>
                <div className={clsx(styles.block, 'flex-column')}>
                    <div className={clsx(styles.title, 'page-title')}>Log in</div>
                    <InputForm fields={loginFields} onSubmit={handleLogin} submitLabel="로그인" />
                    <Link to="/signup" className={clsx(styles.smallText)}>회원이 아니신가요?</Link>
                </div>
            </div>
        </>
    );
}
