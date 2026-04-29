import { http } from "@/api/http"
import type {
  EnqueueResponse,
  QueueStatusResponse,
  RequestEnqueue,
  RequestQueueCancel,
} from "@/types/queue";

export async function enqueue(payload: RequestEnqueue) {
  const enqueueRequest: RequestEnqueue = {
    userId: payload.userId,
    attractionId: payload.attractionId,
    ticketType: payload.ticketType,
  };

  const { data } = await http.post<EnqueueResponse>("/queue/attractions/enqueue", enqueueRequest);
  return {
    position: data.position,
    estimatedMinutes: data.estimatedMinutes ?? 0,
  };
}

export async function getQueueStatus(userId: number) {
  const { data } = await http.get<QueueStatusResponse>(`/queue/attractions/status/${userId}`);
  return data.queues;
}

export async function cancelQueue(payload: RequestQueueCancel) {
  const request: RequestQueueCancel = {
    userId: payload.userId,
    attractionId: payload.attractionId,
  };

  const { data } = await http.post("/queue/attractions/cancel", request);
  return data;
}

export async function boardQueue(payload: RequestQueueCancel) {
  const request: RequestQueueCancel = {
    userId: payload.userId,
    attractionId: payload.attractionId,
  };

  const { data } = await http.post("/queue/attractions/complete", request);
  return data;
}
