import type { TicketKind } from "@/types/ticket";

export type Waiting = {
  ticketType: TicketKind;
  estimatedMinutes: number;
  waitingCount: number;
}

export type AttractionMinutesItem = {
  attractionId: number;
  estimatedMinutes: number;
  waitingMinutesPremium: number;
  waitingMinutesBasic: number;
  queueCountPremium: number;
  queueCountBasic: number;
};

export type AttractionsMinutesSocketMessage = {
  attractions: AttractionMinutesItem[];
};

export type AttractionInfoSocketMessage = {
  attractionId: number;
  waitTimes: Waiting[];
};

export type AttractionListResponseDto = {
  attractionId: number;
  attractionName: string;
  shortDescription: string;
  ridingTime: number;
  openAt: string;
  closeAt: string;
  isActive: boolean;
  capacityPremium: number;
  capacityBasic: number;
  imageUrl: string | null;
  waitingMinutesPremium: number;
  waitingMinutesBasic: number;
  queueCountPremium: number;
  queueCountBasic: number;
};

export type AttractionDetailResponseDto = {
  attractionId: number;
  attractionName: string;
  shortDescription: string;
  detailDescription: string;
  ridingTime: number;
  openAt: string;
  closeAt: string;
  isActive: boolean;
  capacityPremium: number;
  capacityBasic: number;
  imageUrl: string | null;
  waitingMinutesPremium: number;
  waitingMinutesBasic: number;
  queueCountPremium: number;
  queueCountBasic: number;
};

export interface AttractionSummary {
    attractionId: number;
    name: string;
    description: string;
    operatingTime: string;
    basicWaitingMinutes: number;
    imageUrl: string;
}

export interface AttractionDetail {
    attractionId: number;
    name: string;
    isActive: boolean;
    capacityPremium: number;
    capacityBasic: number;
    operatingTime: string;
    shortDescription: string;
    detailDescription: string;
    ridingTime: number;
    waitTimes: Waiting[];
    imageUrl: string;
}
