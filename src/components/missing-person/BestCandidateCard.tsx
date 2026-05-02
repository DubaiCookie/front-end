import type { PersonDetection } from "@/types/ai";
import styles from "./BestCandidateCard.module.css";

type Props = {
  detection: PersonDetection;
  onConfirm: () => void;
  onReject: () => void;
};

/**
 * batch 분석 완료 후 표시되는 최상위 후보 확정 카드.
 * - 맞아요 → 동선(시각·위치) 타임라인 모달 열림
 * - 아니에요 → 전체 후보 리스트로 전환
 */
export default function BestCandidateCard({
  detection,
  onConfirm,
  onReject,
}: Props) {
  const score = Math.round(detection.clothing_match_score * 100);
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.title}>가장 유사한 인물을 찾았어요</span>
        <span className={styles.subtitle}>이 사람이 찾고 계신 아이가 맞나요?</span>
      </div>

      <div className={styles.photoWrap}>
        {detection.thumbnail_b64 ? (
          <img
            className={styles.photo}
            src={`data:image/jpeg;base64,${detection.thumbnail_b64}`}
            alt="가장 유사한 후보"
          />
        ) : (
          <span className={styles.photoPlaceholder} aria-hidden="true">
            ?
          </span>
        )}
        <div className={styles.scoreBadge}>일치도 {score}%</div>
        {detection.is_child && (
          <div className={styles.childBadge}>아동 추정</div>
        )}
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.btnConfirm}
          onClick={onConfirm}
        >
          맞아요, 동선 보기
        </button>
        <button
          type="button"
          className={styles.btnReject}
          onClick={onReject}
        >
          아니에요, 다른 후보 보기
        </button>
      </div>
    </div>
  );
}
