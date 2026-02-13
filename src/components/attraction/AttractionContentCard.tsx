import clsx from "clsx";
import type { AttractionDetail } from "@/types/attraction";
import AttractionMetaItem from "./AttractionMetaItem";
import AttractionWaitingCard from "./AttractionWaitingCard";
import styles from "./AttractionContentCard.module.css";

type AttractionContentCardProps = {
  attraction: AttractionDetail;
  ridingMinutes: number;
  premiumWaitingMinutes: number;
  premiumWaitingCount: number;
  generalWaitingMinutes: number;
  generalWaitingCount: number;
};

export default function AttractionContentCard({
  attraction,
  ridingMinutes,
  premiumWaitingMinutes,
  premiumWaitingCount,
  generalWaitingMinutes,
  generalWaitingCount,
}: AttractionContentCardProps) {
  return (
    <section className={styles.contentCard}>
      <header className={styles.header}>
        <div>
          <p className={styles.subTitle}>{attraction.shortDescription}</p>
          <h1 className={styles.title}>{attraction.name}</h1>
        </div>
        <span className={clsx(styles.statusBadge, attraction.isActive ? styles.active : styles.inactive)}>
          {attraction.isActive ? "운영중" : "운영종료"}
        </span>
      </header>

      <div className={styles.metaGrid}>
        <AttractionMetaItem label="운영시간" value={attraction.operatingTime} />
        <AttractionMetaItem label="탑승시간" value={`${ridingMinutes}분`} />
      </div>

      <section className={styles.waitingSection}>
        <h2 className={styles.sectionTitle}>현재 대기 현황</h2>
        <div className={styles.waitingGrid}>
          <AttractionWaitingCard
            typeLabel="Premium"
            minutes={premiumWaitingMinutes}
            waitingCount={premiumWaitingCount}
          />
          <AttractionWaitingCard
            typeLabel="Basic"
            minutes={generalWaitingMinutes}
            waitingCount={generalWaitingCount}
          />
        </div>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>상세 안내</h2>
        <p className={styles.longDescription}>{attraction.longDescription}</p>
      </section>
    </section>
  );
}
