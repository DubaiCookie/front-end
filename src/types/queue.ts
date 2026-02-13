import type { TicketKind } from "@/types/ticket";

export interface RequestEnqueue {
  userId: number;
  rideId: number;
  ticketType: TicketKind;
}

export interface EnqueueResponse {
  position: number;
  estimatedWaitMinutes: number;
}
