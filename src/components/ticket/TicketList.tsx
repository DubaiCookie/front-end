import clsx from "clsx"
import styles from "./Ticket.module.css"
import type { UserTicket } from "@/types/ticket";
import TicketListItem from "./TicketListItem";

type TicketListProps = {
    tickets: UserTicket[];
    onQrClick: (ticket: UserTicket) => void;
};

export default function TicketList({ tickets, onQrClick }: TicketListProps) {
    return (
    <div className={clsx(styles.ticketList)}>
        {tickets.map((ticket, index) => (
            <TicketListItem
                key={ticket.ticketOrderId ? `ticket-${ticket.ticketOrderId}` : `ticket-fallback-${ticket.availableAt}-${index}`}
                ticket={ticket}
                onQrClick={onQrClick}
            />
        ))}
    </div>)
}
