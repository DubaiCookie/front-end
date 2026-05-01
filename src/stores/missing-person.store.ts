import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { SessionCreateResponse, SessionSummary } from "@/types/ai";

type MissingPersonState = {
  session: SessionCreateResponse | null;
  summary: SessionSummary | null;
  setSession: (session: SessionCreateResponse | null) => void;
  setSummary: (summary: SessionSummary | null) => void;
  reset: () => void;
};

export const useMissingPersonStore = create<MissingPersonState>()(
  persist(
    (set) => ({
      session: null,
      summary: null,
      setSession: (session) => {
        set({ session });
      },
      setSummary: (summary) => {
        set({ summary });
      },
      reset: () => {
        set({ session: null, summary: null });
      },
    }),
    {
      name: "missing-person-session",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
