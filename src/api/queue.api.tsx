import { http } from "@/api/http"
import type { EnqueueResponse, QueueStatusItem, QueueStatusResponse, RequestEnqueue } from "@/types/queue";

export async function enqueue(payload: RequestEnqueue) {
  const enqueueRequest: RequestEnqueue = {
    userId: payload.userId,
    rideId: payload.rideId,
    ticketType: payload.ticketType,
  };

  const { data } = await http.post<EnqueueResponse>("/queue/enqueue", enqueueRequest);
  return data;
}

export async function getQueueStatus(userId: number) {
  const { data } = await http.get<QueueStatusResponse>(`/queue/status/${userId}`);
  return data.items as QueueStatusItem[];
}
