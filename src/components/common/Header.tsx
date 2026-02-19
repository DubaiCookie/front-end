import { useEffect, useState } from 'react';
import clsx from 'clsx';
import styles from '@/components/common/Header.module.css';
import { Link } from 'react-router-dom';
import { useAuthStore } from "@/stores/auth.store";
import { useQueueStore } from "@/stores/queue.store";
import { IoNotifications } from "react-icons/io5";
import { FiLogIn } from "react-icons/fi";
import Modal from '@/components/common/modals/Modal';
import { boardQueue, getQueueStatus } from '@/api/queue.api';

type BoardingModalMode = "confirm" | "success" | "failed" | null;

export default function Header() {
    const username = useAuthStore((s) => s.username);
    const userId = useAuthStore((s) => s.userId);
    const queueAlert = useQueueStore((s) => s.queueAlert);
    const setQueueAlert = useQueueStore((s) => s.setQueueAlert);
    const setLiveQueueItems = useQueueStore((s) => s.setLiveQueueItems);
    const isLoggedIn = Boolean(username);
    const [boardingModalMode, setBoardingModalMode] = useState<BoardingModalMode>(null);
    const [isBoardingSubmitting, setIsBoardingSubmitting] = useState(false);

    useEffect(() => {
        if (!queueAlert || queueAlert.status === "READY") {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setQueueAlert(null);
        }, 30_000);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [queueAlert, setQueueAlert]);

    const handleQueueAlertClick = () => {
        if (!queueAlert) {
            return;
        }

        if (queueAlert.status !== "READY") {
            setQueueAlert(null);
            return;
        }

        setBoardingModalMode("confirm");
    };

    const handleConfirmBoarding = async () => {
        if (isBoardingSubmitting) {
            return;
        }

        if (!queueAlert?.rideId || !userId) {
            setBoardingModalMode("failed");
            return;
        }

        try {
            setIsBoardingSubmitting(true);
            await boardQueue({
                userId,
                rideId: queueAlert.rideId,
            });
            const refreshedQueue = await getQueueStatus(userId);
            setLiveQueueItems(refreshedQueue);
            setQueueAlert(null);
            setBoardingModalMode("success");
        } catch (error) {
            console.error(error);
            setBoardingModalMode("failed");
        } finally {
            setIsBoardingSubmitting(false);
        }
    };

    const queueAlertBodyText = queueAlert
        ? queueAlert.status === "READY"
            ? "지금 탑승 가능합니다. 직원에게 메세지를 보여주세요."
            : "곧 탑승 순서입니다. 탑승 장소로 이동해주세요."
        : "";

    return (
        <>
            <Modal
                isOpen={boardingModalMode !== null}
                title={
                    boardingModalMode === "confirm"
                        ? "탑승"
                        : boardingModalMode === "success"
                            ? "탑승 완료"
                            : "탑승 실패"
                }
                content={
                    boardingModalMode === "confirm"
                        ? "탑승하시겠습니까?"
                        : boardingModalMode === "success"
                            ? "탑승이 완료되었습니다."
                            : "탑승 처리가 실패했습니다."
                }
                buttonTitle="확인"
                onClose={() => {
                    if (isBoardingSubmitting) {
                        return;
                    }
                    setBoardingModalMode(null);
                }}
                onButtonClick={() => {
                    if (boardingModalMode === "confirm") {
                        void handleConfirmBoarding();
                        return;
                    }

                    setBoardingModalMode(null);
                }}
            />
            <header className={clsx(styles.root, 'container', 'flex-row')}>
                <Link to="/attraction" className={styles.logoLink} aria-label="WayThing 홈으로 이동">
                    <img src="/logo-mark.svg" alt="" className={styles.logoIcon} />
                    <span className={styles.logoText}>WayThing</span>
                </Link>
                <div className={clsx('highlight', 'flex-row')}>
                    {isLoggedIn ? (
                        <>
                            <p className={clsx(styles.headerText, styles.userBadge, 'flex-row', 'glass')}>
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
            {queueAlert && (
                <button
                    type="button"
                    className={styles.queueAlert}
                    role="status"
                    aria-live="polite"
                    onClick={handleQueueAlertClick}
                >
                    <span className={styles.queueAlertRideName}>{queueAlert.rideName}</span>
                    <span className={styles.queueAlertBody}>{queueAlertBodyText}</span>
                </button>
            )}
        </>
    );
}
