import { create } from 'zustand';

type AuthState = {
  userId: number | null;
  nickname: string | null;
  accessToken: string | null;
  setAuthUser: (user: { userId: number; nickname: string }) => void;
  setAccessToken: (accessToken: string | null) => void;
  logout: () => void;
};

const bc = new BroadcastChannel('auth');

export const useAuthStore = create<AuthState>((set) => ({
  userId: (() => {
    const value = localStorage.getItem('userId');
    if (!value) return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  })(),
  nickname: localStorage.getItem('nickname'),
  accessToken: localStorage.getItem('accessToken'),
  setAuthUser: ({ userId, nickname }) => {
    const safeNickname = nickname ?? "";
    localStorage.setItem('userId', String(userId));
    localStorage.setItem('nickname', safeNickname);
    set({ userId, nickname: safeNickname });
  },
  setAccessToken: (accessToken) => {
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
    } else {
      localStorage.removeItem('accessToken');
    }
    set({ accessToken });
  },
  logout: () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('nickname');
    localStorage.removeItem('accessToken');
    set({ userId: null, nickname: null, accessToken: null });
    bc.postMessage({ type: 'LOGOUT' });
  },
}));
