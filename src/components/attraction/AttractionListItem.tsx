import clsx from "clsx";
import styles from "./AttractionListItem.module.css";

export default function AttractionListItem() {
  return (
    <div className={clsx(styles.root)}>
      <div>이름</div>
      <div>운영시간</div>
      <div>대기시간</div>
      <div>간단 설명</div>
    </div>
  );
}