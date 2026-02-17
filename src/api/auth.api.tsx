import { http } from "@/api/http";
import type { LoginUser, RequestUser } from "@/types/user";

export type LoginResponse = {
  userId: number;
  username: string;
};

function pickObject(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== "object") {
    return {};
  }
  return payload as Record<string, unknown>;
}

function normalizeLoginResponse(payload: unknown): LoginResponse {
  const root = pickObject(payload);
  const data1 = pickObject(root.data);
  const data2 = pickObject(data1.data);
  const target = Object.keys(data2).length > 0 ? data2 : Object.keys(data1).length > 0 ? data1 : root;

  const rawUserId = target.userId ?? target.user_id ?? target.id;
  const rawUsername = target.username ?? target.userName ?? target.name ?? target.loginId ?? target.user_id;
  const userId = Number(rawUserId);
  const username = String(rawUsername ?? "");

  return {
    userId: Number.isFinite(userId) ? userId : 0,
    username,
  };
}

export async function signup(payload: RequestUser) {
  const signupRequest: RequestUser = {
    username: payload.username,
    password: payload.password,
  };

  const { data } = await http.post("/signup", signupRequest);
  return data;
}

export async function login(payload: LoginUser) {
  const loginRequest: RequestUser = {
    username: payload.userId,
    password: payload.password,
  };

  const { data } = await http.post("/login", loginRequest);
  return normalizeLoginResponse(data);
}

export async function logout() {
  await http.post("/logout");
}
