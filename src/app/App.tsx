import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/app/router';
import Modal from '@/components/common/modals/Modal';
import { useAuthStore } from '@/stores/auth.store';
import { markSessionExpiredHandled, REQUEST_FAILED_EVENT, SESSION_EXPIRED_EVENT } from '@/api/http';
import { subscribeUserQueueStatus } from '@/api/ws';
import { useQueueStore } from '@/stores/queue.store';
import type { QueueEventMessage, UserQueueSocketMessage, UserQueueStatusEvent } from '@/types/queue';

function isUserQueueStatusEvent(payload: UserQueueSocketMessage): payload is UserQueueStatusEvent {
  return "items" in payload;
}

function isQueueEventMessage(payload: UserQueueSocketMessage): payload is QueueEventMessage {
  return "status" in payload;
}

export default function App() {
  const logout = useAuthStore((state) => state.logout);
  const userId = useAuthStore((state) => state.userId);
  const setLiveQueueItems = useQueueStore((state) => state.setLiveQueueItems);
  const setQueueAlert = useQueueStore((state) => state.setQueueAlert);
  const [isSessionExpiredModalOpen, setIsSessionExpiredModalOpen] = useState(false);
  const [isRequestFailedModalOpen, setIsRequestFailedModalOpen] = useState(false);

  useEffect(() => {
    const handleSessionExpired = () => {
      logout();
      setIsSessionExpiredModalOpen(true);
    };

    const handleRequestFailed = () => {
      setIsRequestFailedModalOpen(true);
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    window.addEventListener(REQUEST_FAILED_EVENT, handleRequestFailed);
    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
      window.removeEventListener(REQUEST_FAILED_EVENT, handleRequestFailed);
    };
  }, [logout]);

  useEffect(() => {
    if (!userId) {
      setLiveQueueItems([]);
      setQueueAlert(null);
      return;
    }

    const rideNameById = new Map<number, string>();

    const unsubscribe = subscribeUserQueueStatus(userId, (payload) => {
      if (isUserQueueStatusEvent(payload)) {
        payload.items.forEach((item) => {
          rideNameById.set(item.rideId, item.rideName);
        });
        setLiveQueueItems(payload.items);
        return;
      }

      if (!isQueueEventMessage(payload)) {
        return;
      }

      const rideName = rideNameById.get(payload.rideId) ?? "선택한 어트랙션";
      const message =
        payload.status === "READY"
          ? `${rideName}: 지금 탑승 가능합니다.`
          : `${rideName}: 곧 탑승 순서입니다.`;

      setQueueAlert({
        rideId: payload.rideId,
        rideName,
        status: payload.status,
        message,
      });
    });

    return () => {
      unsubscribe();
    };
  }, [userId, setLiveQueueItems, setQueueAlert]);

  return (
    <>
      <RouterProvider router={router} />
      <Modal
        isOpen={isSessionExpiredModalOpen}
        title="세션 만료"
        content="유효시간이 만료되어 로그아웃 되었습니다."
        buttonTitle="확인"
        onClose={() => {
          setIsSessionExpiredModalOpen(false);
          markSessionExpiredHandled();
        }}
        onButtonClick={() => {
          setIsSessionExpiredModalOpen(false);
          markSessionExpiredHandled();
        }}
      />
      <Modal
        isOpen={isRequestFailedModalOpen}
        title="요청 실패"
        content={
          <>
            진행 중 오류가 발생했습니다.
            <br />
            잠시 후 다시 시도해주세요.
          </>
        }
        buttonTitle="확인"
        onClose={() => {
          setIsRequestFailedModalOpen(false);
        }}
        onButtonClick={() => {
          setIsRequestFailedModalOpen(false);
        }}
      />
    </>
  );
}
