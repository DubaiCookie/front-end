import clsx from "clsx";
import { useEffect, useMemo, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Button from "@/components/common/Button";
import { cancelPaymentOrder } from "@/api/payment.api";
import styles from "./TicketOrderResultPage.module.css";

type PendingPayment = {
  orderId: number;
  amount: number;
  tossOrderId: string;
};

function parseBackendOrderId(tossOrderId: string | null) {
  if (!tossOrderId) return 0;
  const matched = /^ORDER-(\d+)-/.exec(tossOrderId);
  return matched ? Number(matched[1]) : 0;
}

export default function TicketOrderFailPage() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const message = searchParams.get("message");
  const queryBackendOrderId = searchParams.get("backendOrderId");
  const queryTossOrderId = searchParams.get("orderId");
  const hasRequestedCancelRef = useRef(false);

  const pendingPayment = useMemo(() => {
    const raw = sessionStorage.getItem("pending-payment");
    if (!raw) return null;
    try {
      return JSON.parse(raw) as PendingPayment;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (hasRequestedCancelRef.current) return;
    hasRequestedCancelRef.current = true;

    const orderId = Number(
      queryBackendOrderId ?? pendingPayment?.orderId ?? parseBackendOrderId(queryTossOrderId),
    );
    if (!Number.isFinite(orderId) || orderId <= 0) return;

    cancelPaymentOrder(orderId)
      .catch((error) => {
        console.warn("결제 실패 주문 취소에 실패했습니다.", error);
      })
      .finally(() => {
        sessionStorage.removeItem("pending-payment");
      });
  }, [pendingPayment, queryBackendOrderId, queryTossOrderId]);

  return (
    <div className={clsx("container", styles.pageRoot)}>
      <h1 className={styles.title}>결제 실패</h1>
      <p className={styles.description}>
        {message ?? "결제가 취소되었거나 실패했습니다."}
        {code ? ` (code: ${code})` : ""}
      </p>
      <div className={styles.actions}>
        <Link to="/ticket/order">
          <Button title="다시 시도하기" />
        </Link>
      </div>
    </div>
  );
}
