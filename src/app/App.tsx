import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/app/router';
import Modal from '@/components/common/Modal';
import { useAuthStore } from '@/stores/auth.store';
import { markSessionExpiredHandled, SESSION_EXPIRED_EVENT } from '@/api/http';

export default function App() {
  const logout = useAuthStore((state) => state.logout);
  const [isSessionExpiredModalOpen, setIsSessionExpiredModalOpen] = useState(false);

  useEffect(() => {
    const handleSessionExpired = () => {
      logout();
      setIsSessionExpiredModalOpen(true);
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    };
  }, [logout]);

  return (
    <>
      <RouterProvider router={router} />
      <Modal
        isOpen={isSessionExpiredModalOpen}
        title="세션 만료"
        content="유효시간이 만료되어 로그아웃 되었습니다."
        buttonTitle="확인"
        onButtonClick={() => {
          setIsSessionExpiredModalOpen(false);
          markSessionExpiredHandled();
        }}
      />
    </>
  );
}
