import { http } from "@/api/http";
import type { AttractionDetail, AttractionDetailResponseDto, AttractionListResponseDto } from "@/types/attraction";

export async function getAttractionList() {
  const { data } = await http.get<AttractionListResponseDto[]>("/rides");

  return data.map((attraction) => ({
    attractionId: attraction.rideId,
    name: attraction.name,
    description: attraction.shortDescription,
    operatingTime: attraction.operatingTime,
    generalWaitingTime:
      attraction.waitTimes.find((wait) => wait.ticketType === "GENERAL")?.estimatedWaitMinutes ?? 0,
    imageUrl: attraction.photo,
  }));
}

export async function getAttractionDetail(attractionId: number | string) {
  const { data } = await http.get<AttractionDetailResponseDto>(`/rides/${attractionId}`);

  const transformedData: AttractionDetail = {
    attractionId: data.rideId,
    name: data.name,
    isActive: data.isActive,
    capacityTotal: data.capacityTotal,
    capacityPremium: data.capacityPremium,
    capacityGeneral: data.capacityGeneral,
    shortDescription: data.shortDescription,
    longDescription: data.longDescription,
    imageUrl: data.photo,
    operatingTime: data.operatingTime,
    ridingTime: data.ridingTime,
    waitTimes: data.waitTimes,
  };

  return transformedData;
}


