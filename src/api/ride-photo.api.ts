import { http } from "@/api/http";
import type { RidePhoto, RidePhotoRequest } from "@/types/user";

export async function createRidePhoto(payload: RidePhotoRequest): Promise<RidePhoto> {
  const { data } = await http.post<RidePhoto>("/user/ride-photos", payload);
  return data;
}

export async function getMyRidePhotos(): Promise<RidePhoto[]> {
  const { data } = await http.get<RidePhoto[]>("/user/ride-photos/my");
  return data;
}

export async function getRidePhoto(ridePhotoId: number): Promise<RidePhoto> {
  const { data } = await http.get<RidePhoto>(`/user/ride-photos/${ridePhotoId}`);
  return data;
}

export async function deleteRidePhoto(ridePhotoId: number): Promise<void> {
  await http.delete(`/user/ride-photos/${ridePhotoId}`);
}
