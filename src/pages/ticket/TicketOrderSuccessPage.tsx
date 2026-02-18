import clsx from "clsx";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Button from "@/components/common/Button";
import { confirmPayment, type PaymentResponse } from "@/api/payment.api";
import styles from "./TicketOrderResultPage.module.css";
import axios from "axios";

export default function TicketOrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const [isConfirming, setIsConfirming] = useState(true);
  const [result, setResult] = useState<PaymentResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasRequestedConfirmRef = useRef(false);

  const queryPaymentKey = searchParams.get("paymentKey");
  const queryTossOrderId = searchParams.get("orderId");
  const queryAmount = searchParams.get("amount");
  const queryBackendOrderId = searchParams.get("backendOrderId");

  const pendingPayment = useMemo(() => {
    const raw = sessionStorage.getItem("pending-payment");
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as {
        orderId: number;
        amount: number;
        tossOrderId: string;
      };
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (hasRequestedConfirmRef.current) {
      return;
    }
    hasRequestedConfirmRef.current = true;

    const runConfirm = async () => {
      const paymentKey = queryPaymentKey;
      const tossOrderId = queryTossOrderId ?? pendingPayment?.tossOrderId;
      const amount = Number(queryAmount ?? pendingPayment?.amount ?? 0);
      const backendOrderId = Number(queryBackendOrderId ?? pendingPayment?.orderId ?? 0);

      if (!paymentKey || !tossOrderId || Number.isNaN(amount) || amount <= 0 || backendOrderId <= 0) {
        setErrorMessage("결제 승인 파라미터가 올바르지 않습니다.");
        setIsConfirming(false);
        return;
      }

      try {
        setIsConfirming(true);
        const data = await confirmPayment({
          paymentKey,
          orderId: backendOrderId,
          tossOrderId,
          amount,
        });
        setResult(data);
        sessionStorage.removeItem("pending-payment");
      } catch (error) {
        console.error(error);
        if (axios.isAxiosError(error)) {
          const responseData = error.response?.data;
          if (typeof responseData === "string" && responseData.trim().length > 0) {
            setErrorMessage(`결제 승인 실패: ${responseData}`);
          } else if (responseData && typeof responseData === "object") {
            const message =
              (responseData as { message?: string; error?: string; detail?: string }).message ??
              (responseData as { message?: string; error?: string; detail?: string }).error ??
              (responseData as { message?: string; error?: string; detail?: string }).detail;
            setErrorMessage(message ? `결제 승인 실패: ${message}` : "결제 승인에 실패했습니다.");
          } else {
            setErrorMessage(
              `결제 승인 실패: HTTP ${error.response?.status ?? "UNKNOWN"}`,
            );
          }
        } else {
          setErrorMessage("결제 승인에 실패했습니다.");
        }
      } finally {
        setIsConfirming(false);
      }
    };

    void runConfirm();
  }, [pendingPayment, queryAmount, queryBackendOrderId, queryPaymentKey, queryTossOrderId]);

  return (
    <div className={clsx("container", styles.pageRoot)}>
      <h1 className={styles.title}>결제 {isConfirming ? "승인 중" : result ? "완료" : "실패"}</h1>
      <p className={styles.description}>
        {isConfirming && "결제 승인 요청을 처리하고 있습니다."}
        {!isConfirming && result && `${result.orderName} 결제가 처리되었습니다.`}
        {!isConfirming && !result && errorMessage}
      </p>
      <div className={styles.actions}>
        <Link to="/ticket">
          <Button title="내 티켓으로 이동" />
        </Link>
      </div>
    </div>
  );
}
