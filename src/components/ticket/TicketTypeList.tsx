import clsx from "clsx";
import type { TicketKind } from "@/types/ticket";
import TicketTypeListItem from "./TicketTypeListItem";
import styles from "./TicketType.module.css";

type TicketTypeListProps = {
  selectedType: TicketKind | null;
  onSelectType: (type: TicketKind) => void;
};

const ticketTypeOptions: Array<{
  type: TicketKind;
  title: string;
  description: string;
  priceLabel: string;
}> = [
  {
    type: "GENERAL",
    title: "Basic",
    description: "기본 입장권으로 대부분의 어트랙션을 이용할 수 있어요.",
    priceLabel: "₩45,000",
  },
  {
    type: "PREMIUM",
    title: "Premium",
    description: "우선 입장 혜택이 포함된 프리미엄 입장권이에요.",
    priceLabel: "₩90,000",
  },
];

export default function TicketTypeList({ selectedType, onSelectType }: TicketTypeListProps) {
  return (
    <section className={styles.section}>
      <h3 className={clsx("font-h3", styles.title)}>티켓 종류 선택</h3>
      <div className={styles.list}>
        {ticketTypeOptions.map((option) => (
          <TicketTypeListItem
            key={option.type}
            type={option.type}
            title={option.title}
            description={option.description}
            priceLabel={option.priceLabel}
            selected={selectedType === option.type}
            onSelect={onSelectType}
          />
        ))}
      </div>
    </section>
  );
}
