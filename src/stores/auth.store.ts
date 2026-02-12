import { create } from 'zustand';

type AuthState = {
  userId: number | null;
  username: string | null;
  setAuthUser: (user: { userId: number; username: string }) => void;
  logout: () => void;
};

const bc = new BroadcastChannel('auth');

export const useAuthStore = create<AuthState>((set) => ({
  userId: (() => {
    const value = localStorage.getItem('userId');
    if (!value) {
      return null;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  })(),
  username: localStorage.getItem('username'),
  setAuthUser: ({ userId, username }) => {
    localStorage.setItem('userId', String(userId));
    localStorage.setItem('username', username);
    set({ userId, username });
  },
  logout: () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    set({ userId: null, username: null });
    bc.postMessage({ type: 'LOGOUT' });
  },
}));
