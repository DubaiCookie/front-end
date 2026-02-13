import clsx from "clsx";
import { useEffect, useState } from "react";
import type { UserTicket } from "@/types/ticket";
import TicketList from "@/components/ticket/TicketList";
import Button from "@/components/common/Button";
import { Link } from "react-router-dom";

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
    <div className={clsx("container")}>
      <div className={clsx("page-title")}>
        My Ticket</div>
      <TicketList tickets={tickets} />
      <Link to="/ticket/order" className={clsx("button-bottom")}>
        <Button title="티켓 구매하기" />
      </Link>
    </div>
  );
}
