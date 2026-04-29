import { http } from "@/api/http";
import type {
  AttractionDetail,
  AttractionDetailResponseDto,
  AttractionListResponseDto,
  AttractionSummary,
  Waiting,
} from "@/types/attraction";

function formatOperatingTime(openAt?: string | null, closeAt?: string | null) {
  if (!openAt || !closeAt) {
    return "";
  }
  return `${openAt} - ${closeAt}`;
}

function toBasicWaiting(dto: Pick<AttractionListResponseDto, "waitingMinutesBasic" | "queueCountBasic">): Waiting {
  return {
    ticketType: "BASIC",
    estimatedMinutes: dto.waitingMinutesBasic ?? 0,
    waitingCount: dto.queueCountBasic ?? 0,
  };
}

function toPremiumWaiting(dto: Pick<AttractionListResponseDto, "waitingMinutesPremium" | "queueCountPremium">): Waiting {
  return {
    ticketType: "PREMIUM",
    estimatedMinutes: dto.waitingMinutesPremium ?? 0,
    waitingCount: dto.queueCountPremium ?? 0,
  };
}

function toAttractionSummary(dto: AttractionListResponseDto): AttractionSummary {
  return {
    attractionId: dto.attractionId,
    name: dto.attractionName,
    description: dto.shortDescription,
    operatingTime: formatOperatingTime(dto.openAt, dto.closeAt),
    basicWaitingMinutes: dto.waitingMinutesBasic ?? 0,
    imageUrl: dto.imageUrl ?? "",
  };
}

function toAttractionDetail(dto: AttractionDetailResponseDto): AttractionDetail {
  return {
    attractionId: dto.attractionId,
    name: dto.attractionName,
    isActive: dto.isActive,
    capacityPremium: dto.capacityPremium,
    capacityBasic: dto.capacityBasic,
    operatingTime: formatOperatingTime(dto.openAt, dto.closeAt),
    shortDescription: dto.shortDescription,
    detailDescription: dto.detailDescription,
    ridingTime: dto.ridingTime,
    waitTimes: [toPremiumWaiting(dto), toBasicWaiting(dto)],
    imageUrl: dto.imageUrl ?? "",
  };
}

export async function getAttractionList() {
  const { data } = await http.get<AttractionListResponseDto[]>("/attractions");
  return data.map(toAttractionSummary);
}

export async function getAttractionDetail(attractionId: number | string) {
  const { data } = await http.get<AttractionDetailResponseDto>(`/attractions/${attractionId}`);
  return toAttractionDetail(data);
}
