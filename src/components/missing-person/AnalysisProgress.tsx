import styles from "./AnalysisProgress.module.css";

type Props = {
  /** 0.0 ~ 1.0 */
  progress: number;
  processedFrames?: number;
  totalFrames?: number;
};

/**
 * batch 분석 동안 표시되는 진행도 카드.
 * ai-server `/status` 응답의 analysis_progress / processed_frames / total_frames 사용.
 */
export default function AnalysisProgress({
  progress,
  processedFrames,
  totalFrames,
}: Props) {
  const percent = Math.round(Math.max(0, Math.min(1, progress)) * 100);
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.spinner} aria-hidden="true" />
        <span className={styles.title}>실시간 영상을 분석 중입니다</span>
      </div>
      <div
        className={styles.barTrack}
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={styles.barFill}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className={styles.meta}>
        <span className={styles.percent}>{percent}%</span>
        {totalFrames != null && totalFrames > 0 && (
          <span className={styles.counter}>
            {processedFrames ?? 0} / {totalFrames} 프레임
          </span>
        )}
      </div>
      <p className={styles.subtitle}>
        AI 가 영상에서 인상착의와 일치하는 인물을 찾고 있습니다.
      </p>
    </div>
  );
}
