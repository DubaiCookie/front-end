import { http } from "@/api/http";

export interface AttractionImage {
  attractionImageId: number;
  imageUrl: string;
  thumbnailUrl: string | null;
  price: number;
  analysisStatus: "PENDING" | "COMPLETED" | "FAILED";
}

export async function getMyAttractionImages(cycleId: number): Promise<AttractionImage[]> {
  const { data } = await http.get<AttractionImage[]>(
    `/attraction-server/attractions/cycles/${cycleId}/images/my`,
  );
  return data;
}
