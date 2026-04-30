import { http } from "@/api/http";
import type { LoginFormValues, LoginResponse, RefreshResponse, SignupRequest } from "@/types/user";

export async function signup(payload: SignupRequest): Promise<void> {
  await http.post("/user/signup", payload);
}

export async function login(payload: LoginFormValues): Promise<LoginResponse> {
  const { data } = await http.post<LoginResponse>("/user/login", {
    email: payload.email,
    password: payload.password,
  });
  return data;
}

export async function logout(): Promise<void> {
  await http.post("/user/logout");
}

export async function refresh(): Promise<RefreshResponse> {
  const { data } = await http.post<RefreshResponse>("/user/refresh");
  return data;
}

export async function getMe(): Promise<Pick<User, 'userId'>> {
  const { data } = await http.get<Pick<User, 'userId'>>("/user/me");
  return data;
}
