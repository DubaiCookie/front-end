import clsx from "clsx";
import type { TicketKind, TicketProduct } from "@/types/ticket";
import TicketTypeListItem from "./TicketTypeListItem";
import styles from "./TicketType.module.css";

type TicketTypeListProps = {
  tickets: TicketProduct[];
  selectedType: TicketKind | null;
  onSelectType: (type: TicketKind) => void;
  error?: string | null;
};

const TICKET_META: Record<TicketKind, { title: string; description: string }> = {
  BASIC: { title: "Basic", description: "기본 입장권으로 대부분의 어트랙션을 이용할 수 있어요." },
  PREMIUM: { title: "Premium", description: "우선 입장 혜택이 포함된 프리미엄 입장권이에요." },
};

export default function TicketTypeList({ tickets, selectedType, onSelectType, error }: TicketTypeListProps) {
  return (
    <section className={styles.section}>
      <h3 className={clsx("font-h3", styles.title)}>종류 선택</h3>
      {error && <p className={clsx(styles.stateText, styles.errorText)}>{error}</p>}
      {!error && (
        <div className={styles.list}>
          {tickets.map((ticket) => {
            const meta = TICKET_META[ticket.ticketType];
            return (
              <TicketTypeListItem
                key={ticket.ticketType}
                type={ticket.ticketType}
                title={meta.title}
                description={meta.description}
                priceLabel={`₩ ${ticket.price.toLocaleString()}`}
                selected={selectedType === ticket.ticketType}
                onSelect={onSelectType}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
