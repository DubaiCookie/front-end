import clsx from "clsx";
import { Link } from "react-router-dom";
import Button from "@/components/common/Button";
import styles from "./ErrorPage.module.css";

export default function ErrorPage() {
  return (
    <div className={clsx("container", styles.pageRoot)}>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>페이지를 찾을 수 없습니다.</h1>
      <p className={styles.description}>존재하지 않거나 잘못된 주소입니다.</p>
      <Link to="/attraction" className={styles.action}>
        <Button title="홈으로 이동" />
      </Link>
    </div>
  );
}
