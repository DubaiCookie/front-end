import { createBrowserRouter, Navigate } from 'react-router-dom';

import DefaultLayout from '@/layouts/DefaultLayout';

import SignupPage from '@/pages/user/SignupPage';
import LoginPage from '@/pages/user/LoginPage';
import MyPage from '@/pages/user/MyPage';
import AttractionListPage from '@/pages/attraction/AttractionListPage';
import AttractionDetailPage from '@/pages/attraction/AttractionDetailPage';
import TicketListPage from '@/pages/ticket/TicketListPage';
import TicketOrderPage from '@/pages/ticket/TicketOrderPage';
import WaitingListPage from '@/pages/WaitingListPage';

export const router = createBrowserRouter([
  {
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
        element: <AttractionListPage />,
      },
      {
        path: 'attraction/:attractionId',
        element: <AttractionDetailPage />,
      },
      {
        path: 'ticket',
        element: <TicketListPage />,
      },
      {
        path: 'ticket/order',
        element: <TicketOrderPage />,
      },
      {
        path: 'waiting',
        element: <WaitingListPage />,
      },
      {
        path: 'mypage',
        element: <MyPage />,
      },
    ],
  },
]);
