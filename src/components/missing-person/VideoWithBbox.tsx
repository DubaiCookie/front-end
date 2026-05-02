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
    const stroke = Math.max(6, naturalWidth / 120);
    // L자 코너 마커 길이: bbox 크기의 25% 또는 최소 60px
    const cornerLen = Math.max(60, Math.min(w, h) * 0.25);
    const labelH = Math.max(28, naturalWidth / 50);
    const labelW = Math.max(160, naturalWidth / 8);
    const fontSize = Math.max(20, naturalWidth / 60);

    const corner = (x1: number, y1: number, x2a: number, y2a: number, x2b: number, y2b: number) => (
      <polyline
        points={`${x2a},${y2a} ${x1},${y1} ${x2b},${y2b}`}
        fill="none"
        stroke="var(--PRIMARY-PINK)"
        strokeWidth={stroke * 1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );

    return (
      <svg
        className={styles.bboxOverlay}
        viewBox={`0 0 ${naturalWidth} ${naturalHeight}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        {/* 본 박스: 반투명 핑크 fill + 두꺼운 stroke 로 위치 가시성 강화 */}
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          fill="rgba(255, 107, 138, 0.18)"
          stroke="var(--PRIMARY-PINK)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <animate
            attributeName="stroke-opacity"
            values="1;0.45;1"
            dur="1.4s"
            repeatCount="indefinite"
          />
        </rect>

        {/* 4개 코너에 L자 마커 — 박스 가장자리에서 더 도드라지게 보이도록 */}
        {corner(x, y, x + cornerLen, y, x, y + cornerLen)}
        {corner(x + w, y, x + w - cornerLen, y, x + w, y + cornerLen)}
        {corner(x, y + h, x + cornerLen, y + h, x, y + h - cornerLen)}
        {corner(x + w, y + h, x + w - cornerLen, y + h, x + w, y + h - cornerLen)}

        {/* 라벨 */}
        <rect
          x={x}
          y={Math.max(0, y - labelH - 4)}
          width={labelW}
          height={labelH}
          rx={6}
          fill="var(--PRIMARY-PINK)"
        />
        <text
          x={x + 10}
          y={Math.max(0, y - labelH - 4) + labelH * 0.7}
          fill="#fff"
          fontSize={fontSize}
          fontFamily="Pretendard, sans-serif"
          fontWeight="700"
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
