import clsx from "clsx";
import styles from "./TicketOrderPage.module.css";

export default function TicketOrderPage() {
  return (
    <div className={clsx("container", styles.page)}>
      <div className={clsx("page-title", styles.pageTitle)}>Ticket Order Page</div>
    </div>
  );
}