import { http } from "@/api/http";

export interface AttractionImage {
  attractionImageId: number;
  imageUrl: string;
  thumbnailUrl: string | null;
  price: number;
  analysisStatus: "PENDING" | "COMPLETED" | "FAILED";
}

export interface MyPhotoCycle {
  attractionCycleId: number;
  attractionId: number;
  attractionName: string;
  rideDate: string;
  cycleNumber: number;
  photoCount: number;
  thumbnailUrl: string | null;
}

export async function getMyAttractionImages(cycleId: number): Promise<AttractionImage[]> {
  const { data } = await http.get<AttractionImage[]>(
    `/attractions/cycles/${cycleId}/images/my`,
  );
  return data;
}

export async function getMyPhotoCycles(): Promise<MyPhotoCycle[]> {
  const { data } = await http.get<MyPhotoCycle[]>(
    "/attractions/my-photo-cycles",
  );
  return data;
}
