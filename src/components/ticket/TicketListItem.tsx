import clsx from "clsx"
import styles from "./Ticket.module.css"
import type { UserTicket } from "@/types/ticket";
import { formatDateTime, isSameLocalDate } from "@/utils/functions.ts";
import { useState, type MouseEvent } from "react";

type TicketListItemProps = {
    ticket: UserTicket;
    onQrClick: (ticket: UserTicket) => void;
};

export default function TicketListItem({ ticket, onQrClick }: TicketListItemProps) {
    const [isFlipped, setIsFlipped] = useState(false);
    const today = new Date();
    const isAvailableToday = isSameLocalDate(new Date(ticket.availableAt), today);
    const isPremium = ticket.ticketType === "PREMIUM";
    const isActive = ticket.activeStatus === "ACTIVE";

    const headerStatusLabel = isAvailableToday ? "Today" : isActive ? null : "입장 전";

    const handleCardClick = (event: MouseEvent<HTMLElement>) => {
        const target = event.target as HTMLElement;
        if (target.closest("button")) {
            return;
        }
        setIsFlipped((prev) => !prev);
    };

    return (
        <article
            className={styles.ticketFlip}
            onClick={handleCardClick}
        >
            <div className={clsx(styles.ticketInner, isFlipped && styles.flipped)}>
                <div
                    className={clsx(
                        styles.ticket,
                        styles.ticketFace,
                        styles.ticketFront,
                        isPremium ? styles.premium : styles.basic,
                    )}
                >
                    <div className={clsx(styles.gloss)} />
                    <div className={clsx(styles.ticketReflection)} />
                    <div className={clsx(styles.ticketPattern)} />
                    <div className={clsx(styles.edgeCut, styles.edgeCutLeft)} />
                    <div className={clsx(styles.edgeCut, styles.edgeCutRight)} />
                    <div className={clsx(styles.perforation)}>
                        <span className={clsx(styles.perforationDot)} />
                        <span className={clsx(styles.perforationDot)} />
                    </div>
                    {isActive && <div className={clsx(styles.entryStamp)}>입장완료</div>}

                    <header className={clsx(styles.header)}>
                        <p className={clsx(styles.ticketType)}>
                            <span className={clsx(styles.brandName)}>SKALAND</span>
                            <span className={clsx(styles.typeName, isPremium ? styles.typePremium : styles.typeGeneral)}>
                                {isPremium ? "Premium" : "Basic"}
                            </span>
                        </p>
                        {headerStatusLabel && (
                            <span
                                className={clsx(
                                    styles.statusBadge,
                                    isAvailableToday ? styles.statusToday : styles.statusBefore,
                                )}
                            >
                                {headerStatusLabel}
                            </span>
                        )}
                    </header>

                    <div className={styles.row}>
                        <span className={styles.label}>구매 날짜</span>
                        <span className={styles.value}>{formatDateTime(ticket.paymentDate)}</span>
                    </div>
                    <div
                        className={clsx(
                            styles.row,
                            styles.availableRow,
                        )}
                    >
                        <span className={styles.label}>사용 가능 날짜</span>
                        <span className={styles.value}>{formatDateTime(ticket.availableAt)}</span>
                    </div>
                </div>

                <div className={clsx(styles.ticket, styles.ticketFace, styles.ticketBack, isPremium ? styles.premium : styles.basic)}>
                    {isAvailableToday ? (
                        <>
                            <p className={styles.backTitle}>입장 QR</p>
                            <button
                                type="button"
                                className={styles.qrButton}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onQrClick(ticket);
                                }}
                            >
                                <div className={styles.fakeQr} />
                            </button>
                        </>
                    ) : (
                        <p className={styles.qrNotice}>입장 날짜에 QR 코드가 생성됩니다.</p>
                    )}
                </div>
            </div>
        </article>
    );
}
