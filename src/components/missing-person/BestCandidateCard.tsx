import type { PersonDetection } from "@/types/ai";
import styles from "./BestCandidateCard.module.css";

type Props = {
  detection: PersonDetection;
  onConfirm: () => void;
  onReject: () => void;
  confirmLabel?: string;
  rejectLabel?: string;
  disabled?: boolean;
};

/**
 * 후보 인물 확인 카드. 호출자에 따라 다음 두 흐름 중 하나로 동작합니다.
 * - 실시간 흐름: 맞아요 → lockCandidate API → 추적 시작
 * - batch 흐름: 맞아요 → 동선 타임라인 모달
 */
export default function BestCandidateCard({
  detection,
  onConfirm,
  onReject,
  confirmLabel = "맞아요, 추적 시작",
  rejectLabel = "아니에요",
  disabled = false,
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
          disabled={disabled}
        >
          {confirmLabel}
        </button>
        <button
          type="button"
          className={styles.btnReject}
          onClick={onReject}
          disabled={disabled}
        >
          {rejectLabel}
        </button>
      </div>
    </div>
  );
}
