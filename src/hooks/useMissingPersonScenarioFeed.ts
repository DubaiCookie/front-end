import { useEffect, useRef, useState } from "react";
import { getAiWsBaseUrl } from "@/api/ai.api";
import { MISSING_PERSON_WS_PATH } from "@/types/missing-person-ws";

type Options = {
  enabled: boolean;
  sessionId: string | null;
  /** 후보 발견 모달이 떠 있는 동안 프레임 갱신을 멈춰 마지막 화면을 고정합니다. */
  paused: boolean;
};

/**
 * ai-server 의 scenario-feed WebSocket 에 연결해 JPEG 프레임 스트림을 수신합니다.
 *
 * 서버: `handle_scenario_feed` (missing_person_service.py) 가
 *       `await websocket.send_bytes(session.latest_frame_jpeg)` 로 매 프레임을 송신.
 *
 * 클라이언트는 받은 Blob 을 ObjectURL 로 변환해 `<img>` 의 src 로 사용합니다.
 * 직전 프레임의 ObjectURL 은 즉시 revoke 해 메모리 누수를 방지합니다.
 */
export function useMissingPersonScenarioFeed({
  enabled,
  sessionId,
  paused,
}: Options): { frameUrl: string | null; isConnected: boolean } {
  const [frameUrl, setFrameUrl] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const pausedRef = useRef(paused);
  const previousUrlRef = useRef<string | null>(null);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    if (!enabled || !sessionId) {
      return;
    }

    const base = getAiWsBaseUrl();
    const url = `${base}${MISSING_PERSON_WS_PATH}/${sessionId}/scenario-feed`;

    const ws = new WebSocket(url);
    ws.binaryType = "blob";

    ws.addEventListener("open", () => {
      setIsConnected(true);
    });

    ws.addEventListener("message", (event: MessageEvent) => {
      // pause 중이면 새 프레임을 무시해 마지막 화면을 유지합니다.
      if (pausedRef.current) {
        return;
      }
      if (!(event.data instanceof Blob)) {
        return;
      }
      const next = URL.createObjectURL(event.data);
      const prev = previousUrlRef.current;
      previousUrlRef.current = next;
      setFrameUrl(next);
      if (prev) {
        URL.revokeObjectURL(prev);
      }
    });

    ws.addEventListener("close", () => {
      setIsConnected(false);
    });

    ws.addEventListener("error", () => {
      // close 이벤트가 이어서 발생하므로 여기서는 별도 처리하지 않습니다.
    });

    return () => {
      ws.close();
      const last = previousUrlRef.current;
      previousUrlRef.current = null;
      if (last) {
        URL.revokeObjectURL(last);
      }
      setFrameUrl(null);
      setIsConnected(false);
    };
  }, [enabled, sessionId]);

  return { frameUrl, isConnected };
}
