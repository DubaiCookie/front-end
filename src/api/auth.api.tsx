import { http } from "@/api/http";
import type { LoginUser, SignupUser } from "@/types/user";

export type LoginResponse = {
  accessToken?: string;
  token?: string;
};

export async function login(payload: LoginUser) {

  const { data } = await http.post<LoginResponse>("/login", payload);
  return data;
}

type SignupRequest = {
  userId: string;
  userName: string;
  userPassword: string;
};

export async function signup(payload: SignupUser) {
  const signupRequest: SignupRequest = {
    userId: payload.userId,
    userName: payload.userName,
    userPassword: payload.password,
  };

  const { data } = await http.post("/signup", signupRequest);
  return data;
}
