import { createBrowserRouter, Navigate } from 'react-router-dom';

import DefaultLayout from '@/layouts/DefaultLayout';
import TicketWindowLayout from '@/layouts/TicketWindowLayout';

import SignupPage from '@/pages/user/SignupPage';
import LoginPage from '@/pages/user/LoginPage';
import MyPage from '@/pages/user/MyPage';
import AttractionPage from '@/pages/attraction/AttractionPage';
import AttractionDetailPage from '@/pages/attraction/AttractionDetailPage';
import TicketPage from '@/pages/TicketPage';

export const router = createBrowserRouter([
  {
    // ===== 일반 사이트 영역 =====
    path: '/',
    element: <DefaultLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/attraction" replace />,
      },
      {
        path: 'signup',
        element: <SignupPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'attraction',
        children: [
          {
            index: true,
            element: <AttractionPage />,
          },
          {
            path: ':attractionId',
            element: <AttractionDetailPage />,
          }
        ],
      },
      {
        path: 'ticket',
        element: <TicketPage />,
      },
      {
        path: 'mypage/:userId',
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
