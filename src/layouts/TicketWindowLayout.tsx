import { Outlet } from 'react-router-dom';

export default function TicketWindowLayout() {
  return (
    <div className="root">
      <Outlet />
    </div>
  );
}
