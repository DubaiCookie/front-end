import { http } from "@/api/http";
import type { LoginUser, SignupUser } from "@/types/user";

export type LoginResponse = {
  accessToken?: string;
  token?: string;
};

export async function login(payload: LoginUser) {
  // TODO: endpoint 는 필요 시 수정
  const { data } = await http.post<LoginResponse>("/auth/login", payload);
  return data;
}

type SignupRequest = {
  userid: string;
  username: string;
  userpassword: string;
};

export async function signup(payload: SignupUser) {
  const signupRequest: SignupRequest = {
    userid: payload.userId,
    username: payload.userName,
    userpassword: payload.password,
  };

  // TODO: endpoint 는 필요 시 수정
  const { data } = await http.post("/auth/signup", signupRequest);
  return data;
}
