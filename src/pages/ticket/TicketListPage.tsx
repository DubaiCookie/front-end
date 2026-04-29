import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";
import type { UserTicket } from "@/types/ticket";
import TicketList from "@/components/ticket/TicketList";
import Button from "@/components/common/Button";
import { Link } from "react-router-dom";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { getMyTicketList, getTicketErrorMessage } from "@/api/ticket.api";
import styles from "./TicketListPage.module.css";
import EmptyStateMessage from "@/components/common/EmptyStateMessage";
import { IoTicket } from "react-icons/io5";
import Modal from "@/components/common/modals/Modal";
import { useAuthStore } from "@/stores/auth.store";

type TicketModalMode = "alreadyUsed" | "invalidDate" | "showQr" | "error" | null;

export default function TicketListPage() {
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalMode, setModalMode] = useState<TicketModalMode>(null);
  const [selectedTicket, setSelectedTicket] = useState<UserTicket | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const setTodayActiveTicket = useAuthStore((state) => state.setTodayActiveTicket);

  const syncTodayActiveTicketState = useCallback((nextTickets: UserTicket[]) => {
    const availableTodayTicket = nextTickets.find(
      (ticket) => ticket.entryStatus === "AVAILABLE",
    );

    setTodayActiveTicket({
      hasTodayActiveTicket: Boolean(availableTodayTicket),
      todayActiveTicketType: availableTodayTicket?.ticketType ?? null,
      todayActiveIssuedTicketId: availableTodayTicket?.issuedTicketId ?? null,
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
        setErrorMessage(getTicketErrorMessage(error, "내 티켓을 불러오지 못했습니다."));
        setModalMode("error");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchMyTickets();
  }, [syncTodayActiveTicketState]);

  const handleQrClick = (ticket: UserTicket) => {
    setSelectedTicket(ticket);

    if (ticket.entryStatus === "USED") {
      setModalMode("alreadyUsed");
      return;
    }

    if (ticket.entryStatus !== "AVAILABLE") {
      setModalMode("invalidDate");
      return;
    }

    setModalMode("showQr");
  };

  const modalTitle =
    modalMode === "alreadyUsed"
      ? "사용 완료"
      : modalMode === "invalidDate"
      ? "입장 불가"
      : modalMode === "showQr"
        ? "입장 QR"
        : "오류";

  const modalContent =
    modalMode === "alreadyUsed"
      ? "이미 사용 완료된 티켓입니다."
      : modalMode === "invalidDate"
      ? "사용 가능 날짜가 아닙니다."
      : modalMode === "showQr"
        ? selectedTicket?.ticketCode
          ? `티켓 코드: ${selectedTicket.ticketCode}`
          : "발급된 티켓 코드를 확인할 수 없습니다."
        : errorMessage;

  return (
    <div className={clsx("container", styles.pageRoot)}>
      <LoadingSpinner isLoading={isLoading} />
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
          setModalMode(null);
          setSelectedTicket(null);
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
