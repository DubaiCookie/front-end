import { http } from "@/api/http"
import type { EnqueueResponse, RequestEnqueue } from "@/types/queue";

export async function enqueue(payload: RequestEnqueue) {
  const enqueueRequest: RequestEnqueue = {
    userId: payload.userId,
    rideId: payload.rideId,
    ticketType: payload.ticketType,
  };

  const { data } = await http.post<EnqueueResponse>("/queue/enqueue", enqueueRequest);
  return data;
}
