import clsx from "clsx";
import styles from "./AttractionListItem.module.css";
import { IoIosTime } from "react-icons/io";
import { FaCircleDot } from "react-icons/fa6";

// 대기시간 30분 미만일 때 초록색, 30분 이상 60분 미만일 때 주황색, 60분 이상일 때 빨간색

export default function AttractionListItem() {
    return (
        <div className={clsx(styles.root, 'flex-row')}>
            <div className={clsx(styles.info)}>
                <p className={clsx(styles.name)}>이름</p>
                <p className={clsx(styles.description)}>간단 설명</p>
                <p className={clsx(styles.mediumText, 'flex-row')}>
                    <IoIosTime className={clsx(styles.timeIcon)} />
                    <span>09:00 ~ 18:00</span>
                </p>
                <div className={clsx(styles.waitingTimeWrap, styles.mediumText, 'flex-row')}>
                    <span className={clsx(styles.dotIconWrap)}>
                        <FaCircleDot className={clsx(styles.dotIcon)} />
                    </span>
                    <span className={clsx(styles.waitingTime)}>15분</span>
                </div>
            </div>
            <div className={clsx(styles.imageWrap)}>
                <img
                    src="https://www.everland.com/contents/ia/facilities/c44334ad4e7944ada542d692577dd7b5.jpg"
                    alt="어트랙션 이름"
                    className={clsx(styles.image)}
                />
            </div>
        </div>
    );
}
