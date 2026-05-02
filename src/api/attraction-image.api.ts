import { http } from "@/api/http";

export type AnalysisStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface AttractionImage {
  attractionImageId: number;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  price: number;
  analysisStatus: AnalysisStatus;
}

export interface UserPhotoItem {
  attractionImageId: number;
  thumbnailUrl: string | null;
  price: number;
  attractionName: string | null;
  matchedAt: string | null;
  analysisStatus: AnalysisStatus;
}

/**
 * 사용자 매칭 사진 flat 리스트.
 * 회차(cycle) 그룹 없이 본인 얼굴이 매칭된 모든 단체사진을 반환한다.
 */
export async function getMyUserPhotos(): Promise<UserPhotoItem[]> {
  const { data } = await http.get<UserPhotoItem[]>("/attractions/users/me/photos");
  return data;
}

export interface PurchasedPhoto {
  ridePhotoId: number;
  attractionImageId: number;
  attractionName: string;
  rideDate: string;
  imageUrl: string;
}

export async function getMyPurchasedPhotos(): Promise<PurchasedPhoto[]> {
  const { data } = await http.get<PurchasedPhoto[]>("/user/photo-orders/my");
  return data;
}
