import { useCallback, useEffect, useRef, useState } from "react";
import { getAiWsBaseUrl } from "@/api/ai.api";
import type {
  CandidateFoundMessage,
  MissingPersonClientMessage,
  MissingPersonServerMessage,
  TrackingUpdateMessage,
} from "@/types/missing-person-ws";
import { MISSING_PERSON_WS_PATH } from "@/types/missing-person-ws";

export type WsCandidate = {
  candidateId: string;
  photoUrl: string;
};

export type WsBbox = [number, number, number, number];

type UseMissingPersonWsOptions = {
  /** 세션이 활성화되어 있을 때만 연결할지 여부 */
  enabled: boolean;
  sessionId: string | null;
  onCandidateFound: (candidate: WsCandidate) => void;
  onTrackingUpdate: (candidateId: string, bbox: WsBbox) => void;
};

/**
 * ai-server의 미아 탐지 WebSocket에 연결합니다.
 *
 * - 서버로부터 candidate_found 이벤트를 받으면 onCandidateFound 콜백을 호출합니다.
 * - 서버로부터 tracking_update 이벤트를 받으면 onTrackingUpdate 콜백을 호출합니다.
 * - sendMessage를 통해 confirmed/rejected 메시지를 서버로 전송합니다.
 */
export function useMissingPersonWs({
  enabled,
  sessionId,
  onCandidateFound,
  onTrackingUpdate,
}: UseMissingPersonWsOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const sendMessage = useCallback((msg: MissingPersonClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  useEffect(() => {
    if (!enabled || !sessionId) {
      return;
    }

    const base = getAiWsBaseUrl();
    const url = `${base}${MISSING_PERSON_WS_PATH}/${sessionId}`;

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
        const msg = parsed as CandidateFoundMessage;
        onCandidateFound({ candidateId: msg.candidateId, photoUrl: msg.photoUrl });
        return;
      }

      if (parsed.type === "tracking_update") {
        const msg = parsed as TrackingUpdateMessage;
        onTrackingUpdate(msg.candidateId, msg.bbox);
      }
    });

    ws.addEventListener("close", () => {
      setIsConnected(false);
    });

    ws.addEventListener("error", () => {
      // close event이 이어서 발생하므로 별도 처리하지 않습니다.
    });

    return () => {
      ws.close();
      wsRef.current = null;
      setIsConnected(false);
    };
    // onCandidateFound / onTrackingUpdate 는 useCallback으로 안정화된 참조여야 합니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, sessionId]);

  return { isConnected, sendMessage };
}
