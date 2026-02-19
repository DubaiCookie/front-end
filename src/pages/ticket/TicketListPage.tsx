import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";
import type { UserTicket } from "@/types/ticket";
import TicketList from "@/components/ticket/TicketList";
import Button from "@/components/common/Button";
import { Link } from "react-router-dom";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { activateTicket, getMyTicketList } from "@/api/ticket.api";
import styles from "./TicketListPage.module.css";
import EmptyStateMessage from "@/components/common/EmptyStateMessage";
import { IoTicket } from "react-icons/io5";
import Modal from "@/components/common/modals/Modal";
import { isSameLocalDate } from "@/utils/functions";
import { useAuthStore } from "@/stores/auth.store";

type TicketModalMode = "alreadyActive" | "invalidDate" | "confirmEntry" | "entryDone" | null;

export default function TicketListPage() {
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [modalMode, setModalMode] = useState<TicketModalMode>(null);
  const [selectedTicket, setSelectedTicket] = useState<UserTicket | null>(null);
  const setTodayActiveTicket = useAuthStore((state) => state.setTodayActiveTicket);

  const syncTodayActiveTicketState = useCallback((nextTickets: UserTicket[]) => {
    const today = new Date();
    const availableTodayTicket = nextTickets.find(
      (ticket) =>
        isSameLocalDate(new Date(ticket.availableAt), today) &&
        ticket.activeStatus === "ACTIVE",
    );

    setTodayActiveTicket({
      hasTodayActiveTicket: Boolean(availableTodayTicket),
      todayActiveTicketType: availableTodayTicket?.ticketType ?? null,
    });
  }, [setTodayActiveTicket]);

  useEffect(() => {
    const fetchMyTickets = async () => {
      try {
        setIsLoading(true);
        const data = await getMyTicketList();
        setTickets(data);
        syncTodayActiveTicketState(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchMyTickets();
  }, [syncTodayActiveTicketState]);

  const handleQrClick = (ticket: UserTicket) => {
    setSelectedTicket(ticket);

    if (ticket.activeStatus === "ACTIVE") {
      setModalMode("alreadyActive");
      return;
    }

    const isAvailableToday = isSameLocalDate(new Date(ticket.availableAt), new Date());
    if (!isAvailableToday) {
      setModalMode("invalidDate");
      return;
    }

    setModalMode("confirmEntry");
  };

  const handleModalButtonClick = async () => {
    if (modalMode !== "confirmEntry" || !selectedTicket?.ticketOrderId) {
      setModalMode(null);
      return;
    }

    try {
      setIsActivating(true);
      await activateTicket(selectedTicket.ticketOrderId);
      const refreshedTickets = await getMyTicketList();
      setTickets(refreshedTickets);
      syncTodayActiveTicketState(refreshedTickets);

      setModalMode("entryDone");
    } catch (error) {
      console.error(error);
      setModalMode(null);
    } finally {
      setIsActivating(false);
    }
  };

  const modalTitle =
    modalMode === "alreadyActive"
      ? "입장 완료"
      : modalMode === "invalidDate"
      ? "입장 불가"
      : modalMode === "confirmEntry"
        ? "입장 확인"
        : "입장 완료";

  const modalContent =
    modalMode === "alreadyActive"
      ? "이미 입장 완료된 티켓입니다."
      : modalMode === "invalidDate"
      ? "사용 가능 날짜가 아닙니다."
      : modalMode === "confirmEntry"
        ? "입장 하시겠습니까?"
        : "입장되었습니다.";

  return (
    <div className={clsx("container", styles.pageRoot)}>
      <LoadingSpinner isLoading={isLoading || isActivating} />
      <Modal
        isOpen={modalMode !== null}
        title={modalTitle}
        content={modalContent}
        buttonTitle="확인"
        onClose={() => {
          setModalMode(null);
          setSelectedTicket(null);
        }}
        onButtonClick={() => {
          void handleModalButtonClick();
        }}
      />
      <div className={clsx('page-title')}>
        <div className={clsx('glass', 'title-icon-container')}>
          <IoTicket className={clsx('title-icon')} />
        </div>
        <span>My Ticket</span>
      </div>
      {tickets.length > 0 ? (
        <>
          <TicketList tickets={tickets} onQrClick={handleQrClick} />
          <div className={styles.bottomSpacer} />
        </>
      ) : (
        <EmptyStateMessage target="구매한 티켓이" />
      )}
      <Link to="/ticket/order" className={clsx("button-bottom")}>
        <Button title="티켓 구매하기" />
      </Link>
    </div>
  );
}
