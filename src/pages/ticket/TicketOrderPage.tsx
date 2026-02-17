import clsx from "clsx";
import { useState } from "react";
import { MdOutlinePayment } from "react-icons/md";
import Calendar from "@/components/common/Calendar";
import TicketTypeList from "@/components/ticket/TicketTypeList";
import type { TicketKind } from "@/types/ticket";
import Button from "@/components/common/Button";
import { useAuthStore } from "@/stores/auth.store";
import { preparePayment } from "@/api/payment.api";
import styles from "./TicketOrderPage.module.css";
import Modal from "@/components/common/modals/Modal";
import { env } from "@/utils/env";
import ticketTypeStyles from "@/components/ticket/TicketType.module.css";

export default function TicketOrderPage() {
  const userId = useAuthStore((state) => state.userId);
  const username = useAuthStore((state) => state.username);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTicketType, setSelectedTicketType] = useState<TicketKind | null>(null);
  const ticketQuantity = 1;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isQuantityLimitModalOpen, setIsQuantityLimitModalOpen] = useState(false);
  const unavailableDates: string[] = [];

  const loadTossScript = async () => {
    if (window.TossPayments) {
      return window.TossPayments;
    }

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

    if (!window.TossPayments) {
      throw new Error("Toss SDK 초기화에 실패했습니다.");
    }

    return window.TossPayments;
  };

  const handlePayClick = async () => {
    if (!userId || !selectedDate || !selectedTicketType) {
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
      const tossOrderId = `ORDER-${backendOrderId}`;
      const finalAmount = amount;

      if (!Number.isFinite(finalAmount) || finalAmount <= 0) {
        throw new Error(`유효하지 않은 결제 금액입니다. amount=${prepared.amount}`);
      }
      if (!Number.isFinite(backendOrderId) || backendOrderId <= 0) {
        throw new Error(`유효하지 않은 주문 번호입니다. orderId=${prepared.orderId}`);
      }
      if (!orderName) {
        throw new Error("유효하지 않은 주문명입니다.");
      }
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
        JSON.stringify({
          orderId: backendOrderId,
          amount: finalAmount,
          tossOrderId,
        }),
      );

      await tossPayments.requestPayment("CARD", {
        amount: finalAmount,
        orderId: tossOrderId,
        orderName,
        successUrl,
        failUrl,
        customerName: username ?? undefined,
        windowTarget: "iframe",
        card: {
          flowMode: "DEFAULT",
        },
      });
    } catch (error) {
      console.error(error);
      if (error instanceof Error && error.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("결제 준비 중 오류가 발생했습니다.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={clsx("container", styles.pageRoot)}>
      <Modal
        isOpen={Boolean(errorMessage)}
        title="결제 오류"
        content={errorMessage ?? ""}
        buttonTitle="확인"
        onClose={() => {
          setErrorMessage(null);
        }}
        onButtonClick={() => {
          setErrorMessage(null);
        }}
      />
      <Modal
        isOpen={isQuantityLimitModalOpen}
        title="수량 안내"
        content="티켓은 인당 1일 1매만 구매 가능합니다."
        buttonTitle="확인"
        onClose={() => {
          setIsQuantityLimitModalOpen(false);
        }}
        onButtonClick={() => {
          setIsQuantityLimitModalOpen(false);
        }}
      />
      <div className={clsx("page-title")}>
        <div className={clsx("glass", "title-icon-container")}>
          <MdOutlinePayment className={clsx("title-icon")} />
        </div>
        <span>Ticket Order</span>
      </div>
      <h3 className={clsx("font-h3", ticketTypeStyles.title)}>날짜 선택</h3>
      <Calendar
        unavailableDates={unavailableDates}
        onDateSelect={(date) => {
          setSelectedDate(date);
        }}
      />
      <TicketTypeList selectedType={selectedTicketType} onSelectType={setSelectedTicketType} />
      <section className={styles.quantitySection}>
        <h3 className={clsx("font-h3", ticketTypeStyles.title)}>수량 선택</h3>
        <div className={styles.quantityCard}>
          <button
            type="button"
            className={styles.quantityButton}
            onClick={() => {
              setIsQuantityLimitModalOpen(true);
            }}
          >
            -
          </button>
          <span className={styles.quantityValue}>{ticketQuantity}</span>
          <button
            type="button"
            className={styles.quantityButton}
            onClick={() => {
              setIsQuantityLimitModalOpen(true);
            }}
          >
            +
          </button>
        </div>
      </section>
      <div className={styles.bottomSpacer} />
      <div className="button-bottom">
        <Button
          title={isSubmitting ? "결제 준비 중..." : "결제하기"}
          className={styles.payButton}
          onClick={() => {
            void handlePayClick();
          }}
          disabled={!selectedDate || !selectedTicketType || isSubmitting || !userId}
        />
      </div>
    </div>
  );
}
