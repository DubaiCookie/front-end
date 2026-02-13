import clsx from "clsx"
import styles from "./Ticket.module.css"
import type { UserTicket } from "@/types/ticket";
import { formatDateTime, isSameLocalDate } from "@/utils/functions.ts";

export default function TicketListItem(props: { ticket: UserTicket }) {
    const { ticket } = props;
    const today = new Date();
    const isAvailableToday = isSameLocalDate(new Date(ticket.availableAt), today);
    const isPremium = ticket.ticketType === "PREMIUM";
    const isActive = ticket.activeStatus === "ACTIVE";

    const headerStatusLabel = isAvailableToday ? "Today" : isActive ? null : "입장 전";

    return (
        <article
            key={ticket.userTicketId}
            className={clsx(
                styles.ticket,
                isPremium ? styles.premium : styles.basic,
                isAvailableToday && styles.todayAvailable,
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
                <span className={styles.label}>Ticket ID</span>
                <strong className={clsx(styles.value, styles.ticketId)}>#{ticket.userTicketId}</strong>
            </div>
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

        </article>
    )
}
