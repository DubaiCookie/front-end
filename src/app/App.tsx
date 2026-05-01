import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/app/router';
import Modal from '@/components/common/modals/Modal';
import { useAuthStore } from '@/stores/auth.store';
import { markSessionExpiredHandled, REQUEST_FAILED_EVENT, SESSION_EXPIRED_EVENT } from '@/api/http';
import { subscribeUserQueueStatus } from '@/api/ws';
import { useQueueStore } from '@/stores/queue.store';
import type { QueueEventMessage, UserQueueSocketMessage, UserQueueStatusEvent } from '@/types/queue';
import { syncPushTokenIfPermitted } from '@/lib/push-notification';
import { getFirebaseMessaging } from '@/lib/firebase';
import { onMessage } from 'firebase/messaging';
import { SILENT_FOREGROUND_NOTIFICATION_TYPES } from '@/types/notification';

function isUserQueueStatusEvent(payload: UserQueueSocketMessage): payload is UserQueueStatusEvent {
  return "queues" in payload;
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

  // FCM 포그라운드 메시지 핸들러:
  // 사진 알림(RIDE_PHOTO_READY) 등 SILENT_FOREGROUND_NOTIFICATION_TYPES에 속하는 알림은
  // 알림 센터에만 표시하고 포그라운드 팝업은 띄우지 않습니다.
  useEffect(() => {
    let unsubscribeFcm: (() => void) | null = null;

    void (async () => {
      const messaging = await getFirebaseMessaging();
      if (!messaging) return;

      unsubscribeFcm = onMessage(messaging, (payload) => {
        const notificationType =
          (payload.data?.type as string | undefined) ??
          (payload.notification?.title ? "" : "");

        // 사진 알림 타입은 팝업/토스트 없이 무시 (알림 센터에서만 확인 가능)
        if (SILENT_FOREGROUND_NOTIFICATION_TYPES.has(notificationType)) {
          return;
        }

        // 다른 알림 타입에 대한 포그라운드 처리가 필요하면 이 아래에 추가하세요.
      });
    })();

    return () => {
      unsubscribeFcm?.();
    };
  }, []);

  useEffect(() => {
    if (!userId) {
      setLiveQueueItems([]);
      setQueueAlert(null);
      return;
    }

    const attractionNameById = new Map<number, string>();
    void syncPushTokenIfPermitted().catch(console.error);

    const unsubscribe = subscribeUserQueueStatus(userId, (payload) => {
      if (isUserQueueStatusEvent(payload)) {
        payload.queues.forEach((item) => {
          attractionNameById.set(item.attractionId, item.attractionName);
        });
        setLiveQueueItems(payload.queues);
        return;
      }

      if (!isQueueEventMessage(payload)) {
        return;
      }

      const attractionName = payload.attractionName ?? attractionNameById.get(payload.attractionId) ?? "선택한 어트랙션";
      const message =
        payload.status === "READY"
          ? `${attractionName}: 지금 탑승 가능합니다.`
          : `${attractionName}: 곧 탑승 순서입니다.`;

      setQueueAlert({
        attractionId: payload.attractionId,
        attractionName,
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
