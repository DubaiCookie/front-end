import { http } from "@/api/http"
import type {
  EnqueueResponse,
  QueueStatusResponse,
  RequestEnqueue,
  RequestQueueCancel,
} from "@/types/queue";

export async function enqueue(payload: RequestEnqueue) {
  const enqueueRequest: RequestEnqueue = {
    attractionId: payload.attractionId,
    issuedTicketId: payload.issuedTicketId,
  };

  const { data } = await http.post<EnqueueResponse>("/queue/attractions/enqueue", enqueueRequest);
  return {
    position: data.position,
    estimatedMinutes: data.estimatedMinutes ?? 0,
    estimatedCycleNumber: data.estimatedCycleNumber ?? 0,
  };
}

export async function getQueueStatus() {
  const { data } = await http.get<QueueStatusResponse>("/queue/attractions/status");
  return data.queues;
}

export async function cancelQueue(payload: RequestQueueCancel) {
  const request = {
    attractionId: payload.attractionId,
  };

  const { data } = await http.post("/queue/attractions/cancel", request);
  return data;
}

export async function deferQueue(payload: RequestQueueCancel) {
  const request = {
    attractionId: payload.attractionId,
  };

  const { data } = await http.post("/queue/attractions/defer", request);
  return data;
}

export async function boardQueue(payload: RequestQueueCancel) {
  const request = {
    attractionId: payload.attractionId,
  };

  const { data } = await http.post("/queue/attractions/complete", request);
  return data;
}
