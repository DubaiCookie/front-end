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
