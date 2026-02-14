import clsx from "clsx";
import { useState } from "react";
import { MdOutlinePayment } from "react-icons/md";
import Calendar from "@/components/common/Calendar";

export default function TicketOrderPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const unavailableDates: string[] = [];

  return (
    <div className={clsx('container')}>
      <div className={clsx('page-title')}>
        <div className={clsx('glass', 'title-icon-container')}>
          <MdOutlinePayment className={clsx('title-icon')} />
        </div>
        <span>Ticket Order</span>
      </div>
      <Calendar
        unavailableDates={unavailableDates}
        onDateSelect={(date) => {
          setSelectedDate(date);
        }}
      />
      {selectedDate && <p>선택한 날짜: {selectedDate}</p>}
    </div>
  );
}
