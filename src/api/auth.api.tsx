import { http } from "@/api/http";
import type { LoginUser } from "@/types/user";

export type LoginResponse = {
  accessToken?: string;
  token?: string;
};

export async function login(payload: LoginUser) {
  // TODO: endpoint 는 필요 시 수정
  const { data } = await http.post<LoginResponse>("/auth/login", payload);
  return data;
}
