import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Ticketing Demo</h1>
      <Link to="/event/1">회차 1 대기열로 이동</Link>
    </div>
  );
}
