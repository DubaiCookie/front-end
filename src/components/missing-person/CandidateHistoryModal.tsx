import type { PersonDetection } from "@/types/ai";
import styles from "./CandidateHistoryModal.module.css";

type Props = {
  detection: PersonDetection;
  onClose: () => void;
};

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDuration(fromIso: string, toIso: string): string {
  const sec = Math.max(
    0,
    Math.floor((new Date(toIso).getTime() - new Date(fromIso).getTime()) / 1000),
  );
  if (sec < 60) return `${sec}초`;
  const min = Math.floor(sec / 60);
  const remSec = sec % 60;
  return `${min}분 ${remSec}초`;
}

/**
 * 후보 카드를 누르면 표시되는 시각·위치 타임라인 모달.
 *
 * 한 명의 인물(track_id)이 어떤 시각에 어디 CCTV 에 잡혔는지를 보여준다.
 * 같은 위치에서 연속으로 잡힌 sightings 는 묶어서 한 줄로 표시.
 */
export default function CandidateHistoryModal({ detection, onClose }: Props) {
  const sightings = detection.sightings ?? [];
  // 같은 location 의 연속 sightings 를 그룹핑 → "13:24:01 ~ 13:24:18 놀이공원 2구역" 형태
  const groups: { location: string; from: string; to: string; bestScore: number }[] = [];
  for (const s of sightings) {
    const last = groups[groups.length - 1];
    if (last && last.location === s.location) {
      last.to = s.timestamp;
      if (s.clothing_match_score > last.bestScore) last.bestScore = s.clothing_match_score;
    } else {
      groups.push({
        location: s.location,
        from: s.timestamp,
        to: s.timestamp,
        bestScore: s.clothing_match_score,
      });
    }
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.card}>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="닫기"
        >
          ×
        </button>

        <div className={styles.header}>
          {detection.thumbnail_b64 ? (
            <img
              className={styles.thumb}
              src={`data:image/jpeg;base64,${detection.thumbnail_b64}`}
              alt="후보 사진"
            />
          ) : (
            <div className={styles.thumbPlaceholder} aria-hidden="true">
              ?
            </div>
          )}
          <div className={styles.headerInfo}>
            <span className={styles.title}>이 인물의 이동 기록</span>
            <span className={styles.matchScore}>
              일치도 {Math.round(detection.clothing_match_score * 100)}%
            </span>
            {detection.is_child && (
              <span className={styles.childBadge}>아동 추정</span>
            )}
          </div>
        </div>

        {detection.first_seen && detection.last_seen && (
          <div className={styles.summaryRow}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>최초 포착</span>
              <span className={styles.summaryValue}>
                {formatDateTime(detection.first_seen)}
              </span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>최종 포착</span>
              <span className={styles.summaryValue}>
                {formatDateTime(detection.last_seen)}
              </span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>지속</span>
              <span className={styles.summaryValue}>
                {formatDuration(detection.first_seen, detection.last_seen)}
              </span>
            </div>
          </div>
        )}

        <div className={styles.timelineTitle}>이동 타임라인</div>
        {groups.length === 0 ? (
          <p className={styles.empty}>아직 기록된 시각·위치가 없습니다.</p>
        ) : (
          <ul className={styles.timeline}>
            {groups.map((g, i) => (
              <li key={`${g.from}-${i}`} className={styles.timelineItem}>
                <span className={styles.dot} aria-hidden="true" />
                <div className={styles.timelineBody}>
                  <div className={styles.timelineTimes}>
                    {formatDateTime(g.from)}
                    {g.from !== g.to && ` ~ ${formatDateTime(g.to)}`}
                  </div>
                  <div className={styles.timelineLocation}>{g.location}</div>
                  <div className={styles.timelineScore}>
                    최고 일치도 {Math.round(g.bestScore * 100)}%
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
