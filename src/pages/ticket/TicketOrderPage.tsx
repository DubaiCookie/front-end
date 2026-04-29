import clsx from "clsx";
import { useEffect, useState } from "react";
import { MdOutlinePayment } from "react-icons/md";
import Calendar from "@/components/common/Calendar";
import TicketTypeList from "@/components/ticket/TicketTypeList";
import type { TicketKind, TicketProduct } from "@/types/ticket";
import type { AvailableDate } from "@/api/ticket.api";
import Button from "@/components/common/Button";
import { useAuthStore } from "@/stores/auth.store";
import { preparePayment } from "@/api/payment.api";
import {
  getTicketProducts,
  getAvailableDatesByType,
  getTicketErrorMessage,
} from "@/api/ticket.api";
import styles from "./TicketOrderPage.module.css";
import Modal from "@/components/common/modals/Modal";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { env } from "@/utils/env";
import ticketTypeStyles from "@/components/ticket/TicketType.module.css";

const MAX_QUANTITY = 4;
const MIN_QUANTITY = 1;

export default function TicketOrderPage() {
  const userId = useAuthStore((state) => state.userId);
  const nickname = useAuthStore((state) => state.nickname);

  const [tickets, setTickets] = useState<TicketProduct[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [ticketsError, setTicketsError] = useState<string | null>(null);

  const [selectedTicketType, setSelectedTicketType] = useState<TicketKind | null>(null);

  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
  const [datesLoading, setDatesLoading] = useState(false);
  const [datesError, setDatesError] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDateStock, setSelectedDateStock] = useState<number | null>(null);

  const [ticketQuantity, setTicketQuantity] = useState(1);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setTicketsLoading(true);
    setTicketsError(null);
    getTicketProducts()
      .then(setTickets)
      .catch((err) => setTicketsError(getTicketErrorMessage(err, "티켓 종류를 불러오지 못했습니다.")))
      .finally(() => setTicketsLoading(false));
  }, []);

  const handleSelectType = (type: TicketKind) => {
    if (type === selectedTicketType) return;
    setSelectedTicketType(type);
    setSelectedDate(null);
    setSelectedDateStock(null);
    setTicketQuantity(1);
    setDatesError(null);
    setAvailableDates([]);

    setDatesLoading(true);
    getAvailableDatesByType(type)
      .then(setAvailableDates)
      .catch((err) => setDatesError(getTicketErrorMessage(err, "날짜 정보를 불러오지 못했습니다.")))
      .finally(() => setDatesLoading(false));
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setTicketQuantity(1);
    const found = availableDates.find((d) => d.date === date);
    setSelectedDateStock(found?.stock ?? null);
  };

  const handleQuantityChange = (delta: number) => {
    setTicketQuantity((prev) => {
      const next = prev + delta;
      if (next < MIN_QUANTITY) return prev;
      if (next > MAX_QUANTITY) return prev;
      if (selectedDateStock !== null && next > selectedDateStock) return prev;
      return next;
    });
  };

  const loadTossScript = async () => {
    if (window.TossPayments) return window.TossPayments;

    await new Promise<void>((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>('script[data-toss-sdk="true"]');
      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(), { once: true });
        existingScript.addEventListener("error", () => reject(new Error("Toss SDK 로드에 실패했습니다.")), { once: true });
        return;
      }
      const script = document.createElement("script");
      script.src = "https://js.tosspayments.com/v1/payment";
      script.async = true;
      script.dataset.tossSdk = "true";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Toss SDK 로드에 실패했습니다."));
      document.body.appendChild(script);
    });

    if (!window.TossPayments) throw new Error("Toss SDK 초기화에 실패했습니다.");
    return window.TossPayments;
  };

  const handlePayClick = async () => {
    if (!userId || !selectedDate || !selectedTicketType) return;

    if (selectedDateStock !== null && ticketQuantity > selectedDateStock) {
      setErrorMessage(`선택한 날짜의 잔여 재고(${selectedDateStock}장)보다 많은 수량은 구매할 수 없습니다.`);
      return;
    }

    const tossClientKey = env.TOSS_CLIENT_KEY;
    if (!tossClientKey) {
      setErrorMessage("VITE_TOSS_CLIENT_KEY 설정이 필요합니다.");
      return;
    }

    try {
      setIsSubmitting(true);
      const prepared = await preparePayment({
        userId,
        ticketType: selectedTicketType,
        availableDate: selectedDate,
        ticketQuantity,
      });

      const amount = Number(prepared.amount);
      const backendOrderId = Number(prepared.orderId);
      const orderName = String(prepared.orderName ?? "").trim();
      const tossOrderId = `ORDER-${backendOrderId}-${Date.now()}`;

      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error(`유효하지 않은 결제 금액입니다. amount=${prepared.amount}`);
      }
      if (!Number.isFinite(backendOrderId) || backendOrderId <= 0) {
        throw new Error(`유효하지 않은 주문 번호입니다. orderId=${prepared.orderId}`);
      }
      if (!orderName) throw new Error("유효하지 않은 주문명입니다.");
      if (!/^[A-Za-z0-9_-]{6,64}$/.test(tossOrderId)) {
        throw new Error(`토스 주문번호 형식이 올바르지 않습니다. tossOrderId=${tossOrderId}`);
      }

      const TossPayments = await loadTossScript();
      const tossPayments = TossPayments(tossClientKey);
      const baseUrl = env.APP_BASE_URL || window.location.origin;
      const successUrl = `${baseUrl}/ticket/order/success?backendOrderId=${backendOrderId}`;
      const failUrl = `${baseUrl}/ticket/order/fail?backendOrderId=${backendOrderId}`;

      sessionStorage.setItem(
        "pending-payment",
        JSON.stringify({ orderId: backendOrderId, amount, tossOrderId }),
      );

      await tossPayments.requestPayment("CARD", {
        amount,
        orderId: tossOrderId,
        orderName,
        successUrl,
        failUrl,
        customerName: nickname ?? undefined,
        windowTarget: "iframe",
        card: { flowMode: "DEFAULT" },
      });
    } catch (error) {
      console.error(error);
      setErrorMessage(error instanceof Error && error.message ? error.message : "결제 준비 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isQuantityAtMax = ticketQuantity >= MAX_QUANTITY || (selectedDateStock !== null && ticketQuantity >= selectedDateStock);
  const isQuantityAtMin = ticketQuantity <= MIN_QUANTITY;
  const isLowStock = selectedDateStock !== null && selectedDateStock <= 10;

  return (
    <div className={clsx("container", styles.pageRoot)}>
      <LoadingSpinner isLoading={ticketsLoading || datesLoading} />
      <Modal
        isOpen={Boolean(errorMessage)}
        title="오류"
        content={errorMessage ?? ""}
        buttonTitle="확인"
        onClose={() => setErrorMessage(null)}
        onButtonClick={() => setErrorMessage(null)}
      />

      <div className={clsx("page-title")}>
        <div className={clsx("glass", "title-icon-container")}>
          <MdOutlinePayment className={clsx("title-icon")} />
        </div>
        <span>Ticket Order</span>
      </div>

      {/* 1단계: 종류 선택 */}
      <TicketTypeList
        tickets={tickets}
        selectedType={selectedTicketType}
        onSelectType={handleSelectType}
        error={ticketsError}
      />

      {/* 2단계: 날짜 선택 (종류 선택 후 표시) */}
      {selectedTicketType && (
        <>
          <h3 className={clsx("font-h3", ticketTypeStyles.title)} style={{ marginTop: 24 }}>
            날짜 선택
          </h3>
          {datesError && (
            <p className={clsx(styles.loadingDates, styles.stockWarning)}>{datesError}</p>
          )}
          {!datesLoading && !datesError && (
            <Calendar
              key={selectedTicketType}
              availableDates={availableDates.map((d) => d.date)}
              onDateSelect={handleSelectDate}
            />
          )}
        </>
      )}

      {/* 3단계: 수량 선택 (날짜 선택 후 표시) */}
      {selectedDate && selectedDateStock !== null && (
        <section className={styles.quantitySection}>
          <h3 className={clsx("font-h3", ticketTypeStyles.title)}>수량 선택</h3>
          {isLowStock && (
            <p className={clsx(styles.stockInfo, styles.stockWarning)}>
              잔여 재고: {selectedDateStock}장
            </p>
          )}
          {!isLowStock && (
            <p className={styles.stockInfo}>잔여 재고: {selectedDateStock}장</p>
          )}
          <div className={styles.quantityCard}>
            <button
              type="button"
              className={styles.quantityButton}
              onClick={() => handleQuantityChange(-1)}
              disabled={isQuantityAtMin}
              aria-label="수량 감소"
            >
              -
            </button>
            <span className={styles.quantityValue}>{ticketQuantity}</span>
            <button
              type="button"
              className={styles.quantityButton}
              onClick={() => handleQuantityChange(1)}
              disabled={isQuantityAtMax}
              aria-label="수량 증가"
            >
              +
            </button>
          </div>
          <p className={styles.stockInfo}>최소 {MIN_QUANTITY}장 · 최대 {MAX_QUANTITY}장</p>
        </section>
      )}

      <div className={styles.bottomSpacer} />
      <div className="button-bottom">
        <Button
          title={isSubmitting ? "결제 준비 중..." : "결제하기"}
          className={styles.payButton}
          onClick={() => { void handlePayClick(); }}
          disabled={!selectedDate || !selectedTicketType || !selectedDateStock || isSubmitting || !userId}
        />
      </div>
    </div>
  );
}
