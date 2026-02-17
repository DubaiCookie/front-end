import { http } from "@/api/http";
import type { AttractionDetail, AttractionDetailResponseDto, AttractionListResponseDto } from "@/types/attraction";

function normalizeAttractionListPayload(payload: unknown): AttractionListResponseDto[] {
  const queue: unknown[] = [payload];
  const visited = new Set<unknown>();

  while (queue.length > 0) {
    const current = queue.shift();
    if (visited.has(current)) {
      continue;
    }
    visited.add(current);

    if (Array.isArray(current)) {
      const first = current[0] as { rideId?: unknown } | undefined;
      if (!first || typeof first === "object" && "rideId" in first) {
        return current as AttractionListResponseDto[];
      }
      continue;
    }

    if (!current || typeof current !== "object") {
      continue;
    }

    const obj = current as Record<string, unknown>;
    for (const value of Object.values(obj)) {
      queue.push(value);
    }
  }

  return [];
}

export async function getAttractionList() {
  const { data } = await http.get("/rides");
  const list = normalizeAttractionListPayload(data);

  return list.map((attraction) => ({
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
