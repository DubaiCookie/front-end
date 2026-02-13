import clsx from "clsx";
import { useEffect, useState } from "react";
import type { UserTicket } from "@/types/ticket";
import TicketList from "@/components/ticket/TicketList";
import Button from "@/components/common/Button";
import { Link } from "react-router-dom";
import { IoTicket } from "react-icons/io5";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { getMyTicketList } from "@/api/ticket.api";

export default function TicketListPage() {
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchMyTickets = async () => {
      try {
        setIsLoading(true);
        const data = await getMyTicketList();
        setTickets(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchMyTickets();
  }, []);

  return (
    <div className={clsx("container")}>
      <LoadingSpinner isLoading={isLoading} />
      <div className={clsx('page-title')}>
        <div className={clsx('glass', 'title-icon-container')}>
          <IoTicket className={clsx('title-icon')} />
        </div>
        <span>my ticket</span>
      </div>
      <TicketList tickets={tickets} />
      <Link to="/ticket/order" className={clsx("button-bottom")}>
        <Button title="티켓 구매하기" />
      </Link>
    </div>
  );
}
