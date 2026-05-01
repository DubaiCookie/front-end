/**
 * ai-server ↔ 클라이언트 WebSocket 메시지 스키마 (임시 가정값).
 *
 * 백엔드 구현이 확정되면 이 파일의 상수/타입만 수정하면 됩니다.
 * 컴포넌트와 훅은 이 파일에서 타입을 import하므로 변경 지점이 한 곳으로 집중됩니다.
 */

// ── 서버 → 클라이언트 ───────────────────────────────────────────────────────

/** 후보 발견 이벤트: ai-server가 인상착의에 맞는 후보를 발견했을 때 */
export interface CandidateFoundMessage {
  type: "candidate_found";
  /** 후보 사진 URL (또는 data:image/... base64) */
  photoUrl: string;
  /** 세션 내 후보 식별자 */
  candidateId: string;
}

/** 추적 업데이트 이벤트: 확정된 후보의 CCTV 내 현재 위치 좌표 */
export interface TrackingUpdateMessage {
  type: "tracking_update";
  candidateId: string;
  /**
   * bounding box: [x, y, w, h] (픽셀 단위, 영상 원본 해상도 기준)
   * 렌더링 시 영상 엘리먼트의 실제 크기에 맞게 스케일링이 필요합니다.
   */
  bbox: [number, number, number, number];
}

export type MissingPersonServerMessage = CandidateFoundMessage | TrackingUpdateMessage;

// ── 클라이언트 → 서버 ───────────────────────────────────────────────────────

/** 사용자가 "맞아요"를 눌렀을 때 */
export interface CandidateConfirmedMessage {
  type: "candidate_confirmed";
  candidateId: string;
}

/** 사용자가 "아니요"를 눌렀을 때 */
export interface CandidateRejectedMessage {
  type: "candidate_rejected";
  candidateId: string;
}

export type MissingPersonClientMessage =
  | CandidateConfirmedMessage
  | CandidateRejectedMessage;

// ── WS 엔드포인트 상수 ─────────────────────────────────────────────────────

/**
 * ai-server WebSocket 경로.
 * 실제 경로가 확정되면 이 상수를 수정하세요.
 */
export const MISSING_PERSON_WS_PATH = "/ws/missing-person";

/** 발견 위치 하드코딩 텍스트 (추후 서버에서 받아오면 교체) */
export const FOUND_LOCATION_TEXT = "놀이공원 2구역";
