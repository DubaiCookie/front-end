import { createBrowserRouter } from 'react-router-dom';

import DefaultLayout from '@/layouts/DefaultLayout';
import TicketWindowLayout from '@/layouts/TicketWindowLayout';

import HomePage from '@/pages/HomePage';
import MyPage from '@/pages/user/MyPage';
import EventPage from '@/pages/EventPage';
import TicketPage from '@/pages/TicketPage';

export const router = createBrowserRouter([
  {
    // ===== 일반 사이트 영역 =====
    path: '/',
    element: <DefaultLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'event/:eventId',
        element: <EventPage />,
      },
      {
        path: 'mypage',
        element: <MyPage />,
      },
    ],
  },
  {
    // ===== 티켓 예매 팝업 전용 영역 =====
    path: '/ticket-window/:scheduleId',
    element: <TicketWindowLayout />,
    children: [
      {
        index: true,
        element: <TicketPage />,
      },
    ],
  },
]);
