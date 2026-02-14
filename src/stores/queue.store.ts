import { create } from "zustand";
import type { QueueStatusItem } from "@/types/queue";

type QueueState = {
  liveQueueItems: QueueStatusItem[];
  queueAlertMessage: string | null;
  setLiveQueueItems: (items: QueueStatusItem[]) => void;
  setQueueAlertMessage: (message: string | null) => void;
};

export const useQueueStore = create<QueueState>((set) => ({
  liveQueueItems: [],
  queueAlertMessage: null,
  setLiveQueueItems: (items) => {
    set({ liveQueueItems: items });
  },
  setQueueAlertMessage: (message) => {
    set({ queueAlertMessage: message });
  },
}));
