import type { TicketKind } from "@/types/ticket";

export interface RequestEnqueue {
  userId: number;
  rideId: number;
  ticketType: TicketKind;
}

export interface RequestQueueCancel {
  userId: number;
  rideId: number;
}

export interface EnqueueResponse {
  position: number;
  estimatedWaitMinutes: number;
}

export interface QueueStatusItem {
  rideId: number;
  rideName: string;
  ticketType: TicketKind;
  position: number;
  estimatedWaitMinutes: number;
}

export interface QueueStatusResponse {
  items: QueueStatusItem[];
}

export interface UserQueueStatusEvent {
  userId: number;
  items: QueueStatusItem[];
}

export type QueueAlertStatus = "READY" | "ALMOST_READY";

export interface QueueAlert {
  rideId: number;
  rideName: string;
  status: QueueAlertStatus;
  message: string;
}

export interface QueueEventMessage {
  rideId: number;
  userId: number;
  type: TicketKind;
  status: QueueAlertStatus;
}

export type UserQueueSocketMessage = UserQueueStatusEvent | QueueEventMessage;
