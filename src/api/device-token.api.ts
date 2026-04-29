import { http } from "@/api/http";

export type DeviceType = "IOS" | "ANDROID" | "WEB";

export type RegisterDeviceTokenPayload = {
  token: string;
  deviceType: DeviceType;
  userAgent?: string;
};

export async function registerDeviceToken(payload: RegisterDeviceTokenPayload): Promise<void> {
  await http.post("/user/device-tokens", payload);
}

export async function deleteDeviceToken(token: string): Promise<void> {
  await http.delete(`/user/device-tokens/${encodeURIComponent(token)}`);
}
