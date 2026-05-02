import type { WsBbox } from "@/hooks/useMissingPersonWs";
import styles from "./VideoWithBbox.module.css";

type Props = {
  /**
   * 표시할 프레임 URL. ai-server 의 scenario-feed WebSocket 에서 받은 JPEG Blob 의 ObjectURL
   * 또는 일반 이미지 URL. null 이면 placeholder 를 표시합니다.
   */
  src: string | null;
  /**
   * 추적 중인 후보의 bounding box.
   * [x, y, w, h] — 영상 원본 해상도(naturalWidth × naturalHeight) 기준 픽셀값.
   * null 이면 box 를 그리지 않습니다.
   */
  bbox: WsBbox | null;
  /** 영상 원본 너비 (bbox 스케일링에 사용) */
  naturalWidth?: number;
  /** 영상 원본 높이 (bbox 스케일링에 사용) */
  naturalHeight?: number;
};

/**
 * CCTV 영상 플레이어 + bounding box SVG 오버레이.
 *
 * ai-server 가 frame 단위 JPEG 스트림을 WebSocket 으로 푸시하는 구조라,
 * `<video>` 가 아니라 `<img>` 로 매 프레임을 갱신해 표시합니다.
 *
 * 일시정지(후보 발견 모달 중)는 frame URL 을 갱신하지 않는 방식으로
 * `useMissingPersonScenarioFeed` 훅 내부에서 처리됩니다.
 */
export default function VideoWithBbox({
  src,
  bbox,
  naturalWidth = 1920,
  naturalHeight = 1080,
}: Props) {
  const renderBbox = () => {
    if (!bbox) {
      return null;
    }
    const [x, y, w, h] = bbox;
    return (
      <svg
        className={styles.bboxOverlay}
        viewBox={`0 0 ${naturalWidth} ${naturalHeight}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          fill="none"
          stroke="var(--PRIMARY-PINK)"
          strokeWidth={Math.max(3, naturalWidth / 200)}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect
          x={x}
          y={y - 28}
          width={120}
          height={24}
          rx={4}
          fill="var(--PRIMARY-PINK)"
        />
        <text
          x={x + 6}
          y={y - 10}
          fill="#fff"
          fontSize={Math.max(16, naturalWidth / 80)}
          fontFamily="Pretendard, sans-serif"
          fontWeight="600"
        >
          추적 중
        </text>
      </svg>
    );
  };

  return (
    <div className={styles.wrapper}>
      {src ? (
        <>
          <img
            className={styles.video}
            src={src}
            alt="CCTV 실시간 영상"
            draggable={false}
          />
          {renderBbox()}
        </>
      ) : (
        <div className={styles.placeholder}>
          <span className={styles.placeholderIcon} aria-hidden="true">
            &#128247;
          </span>
          <span>CCTV 영상을 준비 중입니다...</span>
        </div>
      )}
    </div>
  );
}
