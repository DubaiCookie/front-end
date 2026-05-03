/**
 * ai-server ↔ 클라이언트 WebSocket 메시지 스키마.
 *
 * 서버: ai-server/app/services/missing_person_service.py 의 handle_watcher 가
 *      세션 상태에 따라 다음 메시지 중 하나를 1초 간격으로 푸시합니다.
 */

// ── 서버 → 클라이언트 ───────────────────────────────────────────────────────

export interface BboxPx {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/** 후보 발견 이벤트: 보호자 확인 대기 중에는 매 폴링마다 재전송됨 */
export interface CandidateFoundMessage {
  type: "candidate_found";
  session_id: string;
  cctv_id: string;
  track_id: number;
  clothing_match_score: number;
  is_child: boolean;
  /** base64 인코딩된 JPEG 썸네일 (data: 접두사 없음) */
  thumbnail_b64: string;
  bbox: BboxPx;
  paused: boolean;
  timestamp: string;
}

/** 추적 업데이트: 확정된 후보의 CCTV 내 현재 위치 */
export interface TrackingUpdateMessage {
  type: "tracking_update";
  cctv_id: string;
  track_id: number;
  bbox: BboxPx;
  clothing_match_score?: number;
  is_child?: boolean;
  thumbnail_b64?: string | null;
  /** tracker가 미탐지지만 유지 중인 경우 true */
  searching?: boolean;
  location?: string;
  timestamp: string;
}

/** 추적 대상이 모든 CCTV에서 사라졌을 때 */
export interface TrackLostMessage {
  type: "track_lost";
  cctv_id: string;
  track_id: number;
  timestamp: string;
}

/** 탐지 후보 요약(폴링 대체용) */
export interface CandidatesMessage {
  type: "candidates";
  session_id: string;
  state: string;
  cctv_summaries: unknown[];
  locked_cctv_id: string | null;
  locked_track_id: number | null;
  timestamp: string;
}

/** 세션 종료 알림 */
export interface SessionEndedMessage {
  type: "session_ended";
  session_id: string;
  final_state: string;
  timestamp: string;
}

export type MissingPersonServerMessage =
  | CandidateFoundMessage
  | TrackingUpdateMessage
  | TrackLostMessage
  | CandidatesMessage
  | SessionEndedMessage;

// ── WS 엔드포인트 상수 ─────────────────────────────────────────────────────

/**
 * ai-server watcher WebSocket 경로 prefix.
 * 실제 연결 URL = `${getAiWsBaseUrl()}${MISSING_PERSON_WS_PATH}/${sessionId}/watch`
 */
export const MISSING_PERSON_WS_PATH = "/missing-person/session";

/** 발견 위치 하드코딩 텍스트 (추후 서버에서 받아오면 교체) */
export const FOUND_LOCATION_TEXT = "놀이공원 2구역";
