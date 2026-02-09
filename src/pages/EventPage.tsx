import { useParams } from 'react-router-dom';

export default function EventPage() {
  const { eventId } = useParams();
  return (
    <div style={{ padding: 24 }}>
      <h1>예매 페이지</h1>
      <p>eventId: {eventId}</p>
      {/* 좌석 조회/hold/order는 여기서 확장 */}
    </div>
  );
}
