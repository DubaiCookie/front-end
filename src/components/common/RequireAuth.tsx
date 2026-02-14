import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "@/components/common/modals/Modal";
import { useAuthStore } from "@/stores/auth.store";

type RequireAuthProps = {
  children: ReactNode;
};

export default function RequireAuth({ children }: RequireAuthProps) {
  const navigate = useNavigate();
  const username = useAuthStore((state) => state.username);
  const isLoggedIn = Boolean(username);

  if (isLoggedIn) {
    return <>{children}</>;
  }

  return (
    <Modal
      isOpen
      title="로그인이 필요합니다"
      content="해당 페이지는 로그인 후 이용할 수 있어요."
      buttonTitle="확인"
      onButtonClick={() => {
        navigate("/login", { replace: true });
      }}
    />
  );
}
