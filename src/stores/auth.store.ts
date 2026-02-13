import { create } from 'zustand';
import type { TicketKind } from '@/types/ticket';

type AuthState = {
  userId: number | null;
  username: string | null;
  hasTodayActiveTicket: boolean;
  todayActiveTicketType: TicketKind | null;
  setAuthUser: (user: { userId: number; username: string }) => void;
  setTodayActiveTicket: (payload: { hasTodayActiveTicket: boolean; todayActiveTicketType: TicketKind | null }) => void;
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
  hasTodayActiveTicket: localStorage.getItem('hasTodayActiveTicket') === 'true',
  todayActiveTicketType: (localStorage.getItem('todayActiveTicketType') as TicketKind | null) ?? null,
  setAuthUser: ({ userId, username }) => {
    localStorage.setItem('userId', String(userId));
    localStorage.setItem('username', username);
    set({ userId, username });
  },
  setTodayActiveTicket: ({ hasTodayActiveTicket, todayActiveTicketType }) => {
    localStorage.setItem('hasTodayActiveTicket', String(hasTodayActiveTicket));
    if (todayActiveTicketType) {
      localStorage.setItem('todayActiveTicketType', todayActiveTicketType);
    } else {
      localStorage.removeItem('todayActiveTicketType');
    }
    set({ hasTodayActiveTicket, todayActiveTicketType });
  },
  logout: () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('hasTodayActiveTicket');
    localStorage.removeItem('todayActiveTicketType');
    set({
      userId: null,
      username: null,
      hasTodayActiveTicket: false,
      todayActiveTicketType: null,
    });
    bc.postMessage({ type: 'LOGOUT' });
  },
}));
