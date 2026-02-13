import clsx from "clsx";
import { MdOutlinePayment } from "react-icons/md";

export default function TicketOrderPage() {
  return (
    <div className={clsx('container')}>
      <div className={clsx('page-title')}>
              <div className={clsx('glass', 'title-icon-container')}>
                <MdOutlinePayment className={clsx('title-icon')} />
              </div>
              <span>ticket order</span>
            </div>
    </div>
  );
}