import clsx from "clsx"
import styles from "./Ticket.module.css"
import type { UserTicket } from "@/types/ticket";
import TicketListItem from "./TicketListItem";

export default function TicketList(props: { tickets: UserTicket[] }) {
    return (
    <div className={clsx(styles.ticketList)}>
        {props.tickets.map((ticket, index) => (
            <TicketListItem
                key={ticket.ticketOrderId ? `ticket-${ticket.ticketOrderId}` : `ticket-fallback-${ticket.availableAt}-${index}`}
                ticket={ticket}
            />
        ))}
    </div>)
}
