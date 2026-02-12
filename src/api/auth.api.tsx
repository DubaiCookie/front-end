import { http } from "@/api/http";
import type { LoginUser, RequestUser } from "@/types/user";

export type LoginResponse = {
  userId: number;
  username: string;
};

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

  const { data } = await http.post<LoginResponse>("/login", loginRequest);
  return data;
}

export async function logout() {
  await http.post("/logout");
}