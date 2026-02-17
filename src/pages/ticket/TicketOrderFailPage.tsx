import clsx from "clsx";
import { Link, useSearchParams } from "react-router-dom";
import Button from "@/components/common/Button";
import styles from "./TicketOrderResultPage.module.css";

export default function TicketOrderFailPage() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const message = searchParams.get("message");

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
