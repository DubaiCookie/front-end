import { useEffect, useRef, useState } from "react";
import { getAiWsBaseUrl } from "@/api/ai.api";
import type {
  MissingPersonServerMessage,
} from "@/types/missing-person-ws";
import { MISSING_PERSON_WS_PATH } from "@/types/missing-person-ws";

/** 후보 정보: lock/reject HTTP 호출 시 서버가 요구하는 식별자 묶음 */
export type WsCandidate = {
  cctvId: string;
  trackId: number;
  /** data URL 형태의 썸네일 (data:image/jpeg;base64,...) */
  photoUrl: string;
  clothingMatchScore: number;
  isChild: boolean;
};

/** 픽셀 단위 bbox (영상 원본 해상도 기준) — 렌더링 시 스케일 보정 필요 */
export type WsBbox = [number, number, number, number];

type UseMissingPersonWsOptions = {
  /** 세션이 활성화되어 있을 때만 연결할지 여부 */
  enabled: boolean;
  sessionId: string | null;
  onCandidateFound: (candidate: WsCandidate) => void;
  onTrackingUpdate: (trackId: number, bbox: WsBbox) => void;
};

/**
 * ai-server 의 미아 탐지 watcher WebSocket 에 연결합니다.
 *
 * - candidate_found → onCandidateFound (보호자 확인 대기 동안 매 1초 재전송됨)
 * - tracking_update → onTrackingUpdate
 * - 사용자 응답(맞아요/아니요)은 WS 가 아니라 HTTP POST 로 보냅니다.
 *   (lockCandidate / rejectCandidate in api/ai.api.ts)
 */
export function useMissingPersonWs({
  enabled,
  sessionId,
  onCandidateFound,
  onTrackingUpdate,
}: UseMissingPersonWsOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!enabled || !sessionId) {
      return;
    }

    const base = getAiWsBaseUrl();
    const url = `${base}${MISSING_PERSON_WS_PATH}/${sessionId}/watch`;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.addEventListener("open", () => {
      setIsConnected(true);
    });

    ws.addEventListener("message", (event: MessageEvent<string>) => {
      let parsed: MissingPersonServerMessage;
      try {
        parsed = JSON.parse(event.data) as MissingPersonServerMessage;
      } catch {
        return;
      }

      if (parsed.type === "candidate_found") {
        const photoUrl = parsed.thumbnail_b64
          ? `data:image/jpeg;base64,${parsed.thumbnail_b64}`
          : "";
        onCandidateFound({
          cctvId: parsed.cctv_id,
          trackId: parsed.track_id,
          photoUrl,
          clothingMatchScore: parsed.clothing_match_score,
          isChild: parsed.is_child,
        });
        return;
      }

      if (parsed.type === "tracking_update") {
        const { x1, y1, x2, y2 } = parsed.bbox;
        onTrackingUpdate(parsed.track_id, [x1, y1, x2 - x1, y2 - y1]);
      }
    });

    ws.addEventListener("close", () => {
      setIsConnected(false);
    });

    ws.addEventListener("error", () => {
      // close event 가 이어서 발생하므로 별도 처리하지 않습니다.
    });

    return () => {
      ws.close();
      wsRef.current = null;
      setIsConnected(false);
    };
    // onCandidateFound / onTrackingUpdate 는 useCallback 으로 안정화된 참조여야 합니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, sessionId]);

  return { isConnected };
}
