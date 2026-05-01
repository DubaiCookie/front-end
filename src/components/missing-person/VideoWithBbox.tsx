import { useEffect, useRef } from "react";
import type { WsBbox } from "@/hooks/useMissingPersonWs";
import styles from "./VideoWithBbox.module.css";

type Props = {
  /** HLS / mp4 URL 등 video src. null이면 placeholder 표시 */
  src: string | null;
  /** 재생/일시정지 제어 */
  paused: boolean;
  /**
   * 추적 중인 후보의 bounding box.
   * [x, y, w, h] — 영상 원본 해상도(naturalVideoWidth × naturalVideoHeight) 기준 픽셀값.
   * null이면 box를 그리지 않습니다.
   */
  bbox: WsBbox | null;
  /** 영상 원본 너비 (bbox 스케일링에 사용) */
  naturalWidth?: number;
  /** 영상 원본 높이 (bbox 스케일링에 사용) */
  naturalHeight?: number;
};

/**
 * CCTV 영상 플레이어 + bounding box SVG 오버레이 컴포넌트.
 *
 * paused prop이 true가 되면 영상을 일시정지하고, false가 되면 재생합니다.
 * bbox가 있으면 SVG로 붉은 테두리 박스를 그립니다.
 */
export default function VideoWithBbox({
  src,
  paused,
  bbox,
  naturalWidth = 1920,
  naturalHeight = 1080,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // paused prop 변화에 따라 play/pause 동기화
  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    if (paused) {
      video.pause();
    } else {
      video.play().catch(() => {
        // autoplay 정책에 의해 거부되는 경우 무시
      });
    }
  }, [paused]);

  // src 변경 시 재생 상태 유지
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) {
      return;
    }
    if (!paused) {
      video.play().catch(() => {});
    }
  }, [src, paused]);

  /**
   * bbox [x, y, w, h]를 SVG viewBox 좌표로 변환합니다.
   * SVG viewBox를 영상 원본 해상도와 동일하게 설정하면
   * CSS object-fit: contain 이 적용되더라도 박스가 정확한 위치에 그려집니다.
   */
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
          <video
            ref={videoRef}
            className={styles.video}
            src={src}
            muted
            playsInline
            loop
            aria-label="CCTV 영상"
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
