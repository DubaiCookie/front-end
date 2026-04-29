import { http } from "@/api/http";
import type { LoginFormValues, SignupRequest, User } from "@/types/user";

export async function signup(payload: SignupRequest): Promise<void> {
  await http.post("/user/signup", payload);
}

export async function login(payload: LoginFormValues): Promise<User> {
  const { data } = await http.post<User>("/user/login", {
    email: payload.email,
    password: payload.password,
  });
  return data;
}

export async function logout(): Promise<void> {
  await http.post("/user/logout");
}

export async function refresh(): Promise<void> {
  await http.post("/user/refresh");
}

export async function getMe(): Promise<Pick<User, 'userId'>> {
  const { data } = await http.get<Pick<User, 'userId'>>("/user/me");
  return data;
}
