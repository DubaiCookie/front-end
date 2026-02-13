import clsx from "clsx";
import styles from "./AttractionListItem.module.css";
import { IoIosTime } from "react-icons/io";
import { FaCircleDot } from "react-icons/fa6";
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

    return (
        <Link to={`/attraction/${attraction.attractionId}`} className={clsx(styles.root, 'flex-row')}>
            <div className={clsx(styles.info)}>
                <p className={clsx(styles.name)}>{attraction.name}</p>
                <p className={clsx(styles.description)}>{attraction.description}</p>
                <p className={clsx(styles.mediumText, styles.operatingTime)}>
                    <IoIosTime className={clsx(styles.timeIcon)} />
                    <span>{attraction.operatingTime}</span>
                </p>
                <div className={clsx(styles.waitingTimeWrap, waitingLevelClass, styles.mediumText, 'flex-row')}>
                    <span className={clsx(styles.dotIconWrap, waitingLevelClass)}>
                        <FaCircleDot className={clsx(styles.dotIcon)} />
                    </span>
                    <span className={clsx(styles.waitingTime)}>{attraction.generalWaitingTime} 분</span>
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
