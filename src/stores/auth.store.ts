import { create } from 'zustand';

type AuthState = {
    accessToken: string | null;
    setAccessToken: (t: string | null) => void;
    clear: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
    accessToken: null,
    setAccessToken: (t) => set({ accessToken: t }),
    clear: () => set({ accessToken: null }),
}));
