import { createBrowserRouter, Navigate } from 'react-router-dom';

import DefaultLayout from '@/layouts/DefaultLayout';
import RequireAuth from '@/components/common/RequireAuth';

import SignupPage from '@/pages/user/SignupPage';
import LoginPage from '@/pages/user/LoginPage';
import MyPage from '@/pages/user/MyPage';
import AttractionListPage from '@/pages/attraction/AttractionListPage';
import AttractionDetailPage from '@/pages/attraction/AttractionDetailPage';
import TicketListPage from '@/pages/ticket/TicketListPage';
import TicketOrderPage from '@/pages/ticket/TicketOrderPage';
import TicketOrderSuccessPage from '@/pages/ticket/TicketOrderSuccessPage';
import TicketOrderFailPage from '@/pages/ticket/TicketOrderFailPage';
import WaitingListPage from '@/pages/WaitingListPage';
import ErrorPage from '@/pages/ErrorPage';

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
        element: <AttractionDetailPage />
      },
      {
        path: 'ticket',
        element: (
          <RequireAuth>
            <TicketListPage />
          </RequireAuth>
        ),
      },
      {
        path: 'ticket/order',
        element: (
          <RequireAuth>
            <TicketOrderPage />
          </RequireAuth>
        ),
      },
      {
        path: 'ticket/order/success',
        element: (
          <RequireAuth>
            <TicketOrderSuccessPage />
          </RequireAuth>
        ),
      },
      {
        path: 'ticket/order/fail',
        element: (
          <RequireAuth>
            <TicketOrderFailPage />
          </RequireAuth>
        ),
      },
      {
        path: 'waiting',
        element: (
          <RequireAuth>
            <WaitingListPage />
          </RequireAuth>
        ),
      },
      {
        path: 'mypage',
        element: (
          <RequireAuth>
            <MyPage />
          </RequireAuth>
        ),
      },
      {
        path: '*',
        element: <ErrorPage />,
      },
    ],
  },
]);
