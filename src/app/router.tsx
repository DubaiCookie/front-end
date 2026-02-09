import { createBrowserRouter } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import EventPage from '@/pages/EventPage';

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/event/:eventId', element: <EventPage /> },
]);

