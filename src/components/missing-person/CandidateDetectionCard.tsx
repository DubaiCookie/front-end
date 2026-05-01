import { FOUND_LOCATION_TEXT } from "@/types/missing-person-ws";
import styles from "./CandidateDetectionCard.module.css";

type Props = {
  photoUrl: string;
  /** "pending" → 버튼 표시, "confirmed" → 위치 배너 표시 */
  mode: "pending" | "confirmed";
  onConfirm: () => void;
  onReject: () => void;
  /** confirmed 상태에서 카드를 닫을 때 */
  onClose: () => void;
};

/**
 * ai-server가 candidate_found 이벤트를 보냈을 때 렌더링되는 카드.
 *
 * - mode="pending" : 후보 사진 + "맞아요" / "아니요" 버튼
 * - mode="confirmed": 위치 텍스트 배너 표시 + 닫기 버튼
 */
export default function CandidateDetectionCard({
  photoUrl,
  mode,
  onConfirm,
  onReject,
  onClose,
}: Props) {
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="후보 발견 알림">
      <div className={styles.card}>
        {mode === "confirmed" && (
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="닫기"
          >
            ×
          </button>
        )}

        <div className={styles.header}>
          <span className={styles.pulseDot} aria-hidden="true" />
          <span className={styles.title}>후보를 발견했습니다</span>
        </div>

        <p className={styles.subtitle}>
          {mode === "pending"
            ? "아래 사진이 찾고 있는 아이인가요?"
            : "추적을 시작합니다. 아래 위치를 확인하세요."}
        </p>

        <div className={styles.photoWrap}>
          {photoUrl ? (
            <img
              src={photoUrl}
              alt="탐지된 후보 사진"
              className={styles.photo}
            />
          ) : (
            <span className={styles.photoPlaceholder} aria-hidden="true">
              ?
            </span>
          )}
        </div>

        {mode === "pending" && (
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.btnConfirm}
              onClick={onConfirm}
            >
              맞아요
            </button>
            <button
              type="button"
              className={styles.btnReject}
              onClick={onReject}
            >
              아니요
            </button>
          </div>
        )}

        {mode === "confirmed" && (
          <div className={styles.locationBanner} role="status">
            <span className={styles.locationLabel}>현재 위치</span>
            <span className={styles.locationValue}>{FOUND_LOCATION_TEXT}</span>
          </div>
        )}
      </div>
    </div>
  );
}
