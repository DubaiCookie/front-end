import { create } from "zustand";
import type { QueueAlert, QueueStatusItem } from "@/types/queue";

type QueueState = {
  liveQueueItems: QueueStatusItem[];
  queueAlert: QueueAlert | null;
  setLiveQueueItems: (items: QueueStatusItem[]) => void;
  setQueueAlert: (alert: QueueAlert | null) => void;
};

export const useQueueStore = create<QueueState>((set) => ({
  liveQueueItems: [],
  queueAlert: null,
  setLiveQueueItems: (items) => {
    set({ liveQueueItems: items });
  },
  setQueueAlert: (alert) => {
    set({ queueAlert: alert });
  },
}));
