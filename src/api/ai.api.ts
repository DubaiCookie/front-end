import axios from "axios";
import { env } from "@/utils/env";
import type {
  FaceRegisterResponse,
  FaceUnregisterResponse,
  SessionCreateRequest,
  SessionCreateResponse,
  SessionSummary,
  LockCandidateRequest,
} from "@/types/ai";

// Ingress 라우팅: /api/face/* → ai-server, /api/missing-person/* → ai-server
// /ai-server 접두사 없이 /api 직접 사용
const AI_BASE_URL = env.API_BASE_URL;

const aiHttp = axios.create({
  baseURL: AI_BASE_URL,
  timeout: 60_000,
  withCredentials: true,
});

// ── Face ─────────────────────────────────────────────────────────────────────

/**
 * 사용자 얼굴 사진 1장을 등록합니다.
 * replace=true 이면 기존 등록 사진 전체 삭제 후 재등록합니다.
 */
export async function registerFace(
  photo: File,
  replace = false,
): Promise<FaceRegisterResponse> {
  const form = new FormData();
  form.append("photo", photo);

  const { data } = await aiHttp.post<FaceRegisterResponse>(
    `/face/register?replace=${replace}`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}

/** 등록된 사용자 얼굴 삭제 */
export async function unregisterFace(): Promise<FaceUnregisterResponse> {
  const { data } = await aiHttp.delete<FaceUnregisterResponse>("/face/register");
  return data;
}

/**
 * 단체 사진에서 사용자를 탐색합니다.
 * 결과 이미지(JPEG bytes)를 Blob URL로 반환합니다.
 */
export async function findFaceThumbnail(groupPhoto: File): Promise<string> {
  const form = new FormData();
  form.append("group_photo", groupPhoto);

  const response = await aiHttp.post("/face/find/thumbnail", form, {
    headers: { "Content-Type": "multipart/form-data" },
    responseType: "blob",
  });

  return URL.createObjectURL(response.data as Blob);
}

// ── Missing person ────────────────────────────────────────────────────────────

/** 미아 탐지 세션을 생성합니다. */
export async function createMissingPersonSession(
  body: SessionCreateRequest,
): Promise<SessionCreateResponse> {
  const { data } = await aiHttp.post<SessionCreateResponse>(
    "/missing-person/session",
    body,
  );
  return data;
}

/** 후보 인물 lock-on → 추적 시작 */
export async function lockCandidate(
  sessionId: string,
  body: LockCandidateRequest,
): Promise<void> {
  await aiHttp.post(`/missing-person/session/${sessionId}/lock`, body);
}

/** 현재 탐지 결과 폴링 */
export async function getSessionStatus(
  sessionId: string,
): Promise<SessionSummary> {
  const { data } = await aiHttp.get<SessionSummary>(
    `/missing-person/session/${sessionId}/status`,
  );
  return data;
}

/** 보호자가 아이를 직접 만났을 때 세션 종료 */
export async function markSessionFound(sessionId: string): Promise<void> {
  await aiHttp.post(`/missing-person/session/${sessionId}/found`);
}

/** 직원 도움 요청 */
export async function requestStaff(
  sessionId: string,
  message?: string,
): Promise<void> {
  await aiHttp.post(`/missing-person/session/${sessionId}/request-staff`, {
    message: message ?? null,
  });
}

/** 탐지 세션 강제 종료 */
export async function endSession(sessionId: string): Promise<void> {
  await aiHttp.delete(`/missing-person/session/${sessionId}`);
}

// ── WebSocket helpers ────────────────────────────────────────────────────────

/**
 * ai-server base URL 에서 ws(s):// 주소를 파생합니다.
 * VITE_AI_WS_URL 이 없으면 API_BASE_URL 에서 프로토콜만 변환합니다.
 */
export function getAiWsBaseUrl(): string {
  const base = AI_BASE_URL.replace(/^http/, "ws");
  return base;
}
