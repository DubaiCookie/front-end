import type { TicketKind } from "@/types/ticket";

export interface RequestEnqueue {
  attractionId: number;
  issuedTicketId: number;
}

export interface RequestQueueCancel {
  userId: number;
  attractionId: number;
}

export type QueueStatus = "WAITING" | "AVAILABLE";

export interface EnqueueResponse {
  position: number;
  estimatedMinutes: number;
  estimatedCycleNumber: number;
}

export interface QueueStatusItem {
  attractionId: number;
  attractionName: string;
  ticketType: TicketKind;
  status: QueueStatus;
  position: number;
  estimatedMinutes: number;
  deferCount: number;
}

export interface QueueStatusResponse {
  userId: number;
  queues: QueueStatusItem[];
}

export interface UserQueueStatusEvent {
  userId: number;
  queues: QueueStatusItem[];
}

export type QueueAlertStatus = "READY" | "ALMOST_READY";

export interface QueueAlert {
  attractionId: number;
  attractionName: string;
  status: QueueAlertStatus;
  message: string;
}

export interface QueueEventMessage {
  attractionId: number;
  attractionName?: string;
  userId: number;
  type: TicketKind;
  status: QueueAlertStatus;
}

export type UserQueueSocketMessage = UserQueueStatusEvent | QueueEventMessage;
