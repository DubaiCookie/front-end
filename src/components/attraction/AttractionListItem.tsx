import clsx from "clsx";
import styles from "./AttractionListItem.module.css";
import { IoIosTime } from "react-icons/io";
import type { AttractionSummary } from "@/types/attraction";
import { Link } from "react-router-dom";

type AttractionListItemProps = {
    attraction: AttractionSummary;
};

export default function AttractionListItem({ attraction }: AttractionListItemProps) {
    const waitingLevelClass =
        attraction.generalWaitingTime < 30
            ? styles.waitingLow
            : attraction.generalWaitingTime < 60
                ? styles.waitingMid
                : styles.waitingHigh;
    const waitingLabel =
        attraction.generalWaitingTime < 30
            ? "여유"
            : attraction.generalWaitingTime < 60
                ? "보통"
                : "혼잡";

    return (
        <Link to={`/attraction/${attraction.attractionId}`} className={styles.root}>
            <div className={clsx(styles.info)}>
                <p className={clsx(styles.name)}>{attraction.name}</p>
                <p className={clsx(styles.description)}>{attraction.description}</p>
                <p className={clsx(styles.mediumText, styles.operatingTime)}>
                    <IoIosTime className={clsx(styles.timeIcon)} />
                    <span>{attraction.operatingTime}</span>
                </p>
                <div className={clsx(styles.waitingTimeWrap, waitingLevelClass, styles.mediumText)}>
                    <span className={styles.waitingLabel}>{waitingLabel}</span>
                    <span className={styles.waitingDivider}>|</span>
                    <span className={styles.waitingTimeValue}>{attraction.generalWaitingTime}분</span>
                </div>
            </div>
            <div className={clsx(styles.imageWrap)}>
                <img
                    src={attraction.imageUrl}
                    alt={attraction.name}
                    className={clsx(styles.image)}
                />
            </div>
        </Link>
    );
}
