import { http } from "@/api/http"
import type {
  EnqueueResponse,
  QueueStatusItem,
  QueueStatusResponse,
  RequestEnqueue,
  RequestQueueCancel,
} from "@/types/queue";

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

export async function cancelQueue(payload: RequestQueueCancel) {
  const request: RequestQueueCancel = {
    userId: payload.userId,
    rideId: payload.rideId,
  };

  const { data } = await http.post("/queue/cancel", request);
  return data;
}

export async function boardQueue(payload: RequestQueueCancel) {
  const request: RequestQueueCancel = {
    userId: payload.userId,
    rideId: payload.rideId,
  };

  const { data } = await http.post("/queue/complete", request);
  return data;
}
