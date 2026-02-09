import { create } from 'zustand';

type AuthState = {
  accessToken: string | null;
  setAccessToken: (t: string | null) => void;
  logout: () => void;
};

const bc = new BroadcastChannel('auth');

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: localStorage.getItem('accessToken'),
  setAccessToken: (t) => {
    if (t) localStorage.setItem('accessToken', t);
    else localStorage.removeItem('accessToken');
    set({ accessToken: t });
  },
  logout: () => {
    localStorage.removeItem('accessToken');
    set({ accessToken: null });
    bc.postMessage({ type: 'LOGOUT' });
  },
}));
