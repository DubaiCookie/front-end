import { create } from 'zustand';
import type { TicketKind } from '@/types/ticket';

type AuthState = {
  userId: number | null;
  nickname: string | null;
  hasTodayActiveTicket: boolean;
  todayActiveTicketType: TicketKind | null;
  todayActiveIssuedTicketId: number | null;
  setAuthUser: (user: { userId: number; nickname: string }) => void;
  setTodayActiveTicket: (payload: {
    hasTodayActiveTicket: boolean;
    todayActiveTicketType: TicketKind | null;
    todayActiveIssuedTicketId?: number | null;
  }) => void;
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
  nickname: localStorage.getItem('nickname'),
  hasTodayActiveTicket: localStorage.getItem('hasTodayActiveTicket') === 'true',
  todayActiveTicketType: (localStorage.getItem('todayActiveTicketType') as TicketKind | null) ?? null,
  todayActiveIssuedTicketId: (() => {
    const value = localStorage.getItem('todayActiveIssuedTicketId');
    if (!value) {
      return null;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  })(),
  setAuthUser: ({ userId, nickname }) => {
    const safeNickname = nickname ?? "";
    localStorage.setItem('userId', String(userId));
    localStorage.setItem('nickname', safeNickname);
    set({ userId, nickname: safeNickname });
  },
  setTodayActiveTicket: ({ hasTodayActiveTicket, todayActiveTicketType, todayActiveIssuedTicketId }) => {
    localStorage.setItem('hasTodayActiveTicket', String(hasTodayActiveTicket));
    if (todayActiveTicketType) {
      localStorage.setItem('todayActiveTicketType', todayActiveTicketType);
    } else {
      localStorage.removeItem('todayActiveTicketType');
    }
    if (todayActiveIssuedTicketId) {
      localStorage.setItem('todayActiveIssuedTicketId', String(todayActiveIssuedTicketId));
    } else {
      localStorage.removeItem('todayActiveIssuedTicketId');
    }
    set({ hasTodayActiveTicket, todayActiveTicketType, todayActiveIssuedTicketId: todayActiveIssuedTicketId ?? null });
  },
  logout: () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('nickname');
    localStorage.removeItem('hasTodayActiveTicket');
    localStorage.removeItem('todayActiveTicketType');
    localStorage.removeItem('todayActiveIssuedTicketId');
    set({
      userId: null,
      nickname: null,
      hasTodayActiveTicket: false,
      todayActiveTicketType: null,
      todayActiveIssuedTicketId: null,
    });
    bc.postMessage({ type: 'LOGOUT' });
  },
}));
