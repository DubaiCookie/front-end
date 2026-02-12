import clsx from "clsx";
import styles from "./TicketListPage.module.css";
import type { UserTicket } from "@/types/ticket";
import TicketList from "@/components/ticket/TicketList";

const tickets: UserTicket[] = [
  {
    userTicketId: 10249381,
    availableAt: "2026-02-12T09:00:00",
    activeStatus: "ACTIVE",
    ticketType: "PREMIUM",
    paymentDate: "2026-02-11T14:25:00",
  },
  {
    userTicketId: 10249382,
    availableAt: "2026-02-14T09:00:00",
    activeStatus: "DEACTIVE",
    ticketType: "GENERAL",
    paymentDate: "2026-02-10T18:40:00",
  },
];

export default function TicketListPage() {
  return (
    <div className={clsx("container", styles.page)}>
      <div className={clsx("page-title", styles.pageTitle)}>
        My Ticket</div>
      <TicketList tickets={tickets} />
    </div>
  );
}
