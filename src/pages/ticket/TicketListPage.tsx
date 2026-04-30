import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";
import type { UserTicket } from "@/types/ticket";
import TicketList from "@/components/ticket/TicketList";
import Button from "@/components/common/Button";
import { Link } from "react-router-dom";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { enterTicket, getMyTicketList, getTicketErrorMessage } from "@/api/ticket.api";
import styles from "./TicketListPage.module.css";
import EmptyStateMessage from "@/components/common/EmptyStateMessage";
import { IoTicket } from "react-icons/io5";
import Modal from "@/components/common/modals/Modal";
import { useAuthStore } from "@/stores/auth.store";
import { QRCodeSVG } from "qrcode.react";

type TicketModalMode = "alreadyUsed" | "invalidDate" | "showQr" | "entrySuccess" | "error" | null;

export default function TicketListPage() {
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
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

  const handleEntry = async () => {
    if (!selectedTicket?.ticketCode || isEntering) return;
    setIsEntering(true);
    try {
      await enterTicket(selectedTicket.ticketCode);
      const updatedTickets = tickets.map((t) =>
        t.issuedTicketId === selectedTicket.issuedTicketId
          ? { ...t, entryStatus: "USED" as const }
          : t,
      );
      setTickets(updatedTickets);
      syncTodayActiveTicketState(updatedTickets);
      setModalMode("entrySuccess");
    } catch (error) {
      setErrorMessage(getTicketErrorMessage(error, "입장 처리 중 오류가 발생했습니다."));
      setModalMode("error");
    } finally {
      setIsEntering(false);
    }
  };

  const modalTitle =
    modalMode === "alreadyUsed" ? "사용 완료" :
    modalMode === "invalidDate" ? "입장 불가" :
    modalMode === "showQr"      ? "입장 QR" :
    modalMode === "entrySuccess" ? "입장 완료" :
    "오류";

  const modalContent =
    modalMode === "alreadyUsed" ? "이미 사용 완료된 티켓입니다." :
    modalMode === "invalidDate" ? "사용 가능 날짜가 아닙니다." :
    modalMode === "entrySuccess" ? "입장이 완료되었습니다. 즐거운 시간 보내세요! 🎡" :
    modalMode === "showQr" ? (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        {selectedTicket?.ticketCode ? (
          <QRCodeSVG value={selectedTicket.ticketCode} size={180} bgColor="#fff" fgColor="#1a202c" />
        ) : (
          <p>티켓 코드를 확인할 수 없습니다.</p>
        )}
        <button
          type="button"
          onClick={() => { void handleEntry(); }}
          disabled={isEntering}
          style={{
            width: "100%",
            padding: "10px 14px",
            border: "none",
            borderRadius: 10,
            background: isEntering ? "#ccc" : "var(--PRIMARY-PINK)",
            color: "#fff",
            fontWeight: 600,
            fontSize: "var(--font-size-sm)",
            cursor: isEntering ? "not-allowed" : "pointer",
          }}
        >
          {isEntering ? "처리 중..." : "입장 완료"}
        </button>
      </div>
    ) :
    errorMessage;

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
