import clsx from "clsx";
import { useState } from "react";
import { logout as logoutApi } from "@/api/auth.api";
import { useAuthStore } from "@/stores/auth.store";
import { useNavigate } from "react-router-dom";
import MenuList from "@/components/common/lists/MenuList";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { FaUserCircle } from "react-icons/fa";
import Modal from "@/components/common/modals/Modal";

export default function MyPage() {
  const logoutStore = useAuthStore((state) => state.logout);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreparingModalOpen, setIsPreparingModalOpen] = useState(false);
  const [selectedMenuLabel, setSelectedMenuLabel] = useState("");
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      setIsSubmitting(true);
      await logoutApi();
    } catch (error) {
      console.error(error);
    } finally {
      logoutStore();
      setIsSubmitting(false);
      navigate("/attraction", { replace: true });
    }
  };

  const openPreparingModal = (label: string) => {
    setSelectedMenuLabel(label);
    setIsPreparingModalOpen(true);
  };

  const menuItems = [
    {
      label: "결제 내역",
      onClick: () => openPreparingModal("결제 내역"),
      disabled: isSubmitting,
    },
    {
      label: "티켓 사용 내역",
      onClick: () => openPreparingModal("티켓 사용 내역"),
      disabled: isSubmitting,
    },
    {
      label: "결제 수단 관리",
      onClick: () => openPreparingModal("결제 수단 관리"),
      disabled: isSubmitting,
    },
    {
      label: "알림 설정",
      onClick: () => openPreparingModal("알림 설정"),
      disabled: isSubmitting,
    },
    {
      label: "공지사항",
      onClick: () => openPreparingModal("공지사항"),
      disabled: isSubmitting,
    },
    {
      label: "자주 묻는 질문",
      onClick: () => openPreparingModal("자주 묻는 질문"),
      disabled: isSubmitting,
    },
    {
      label: "로그아웃",
      onClick: handleLogout,
      disabled: isSubmitting,
    },
    {
      label: "회원 탈퇴",
      onClick: () => openPreparingModal("회원 탈퇴"),
      disabled: isSubmitting,
    },
  ];

  return (
    <div className={clsx("container")}>
      <Modal
        isOpen={isPreparingModalOpen}
        title="준비중"
        content={`${selectedMenuLabel} 기능은 준비중입니다.`}
        buttonTitle="확인"
        onClose={() => {
          setIsPreparingModalOpen(false);
          setSelectedMenuLabel("");
        }}
        onButtonClick={() => {
          setIsPreparingModalOpen(false);
          setSelectedMenuLabel("");
        }}
      />
      <div className={clsx('page-title')}>
        <div className={clsx('glass', 'title-icon-container')}>
          <FaUserCircle className={clsx('title-icon')} />
        </div>
        <span>My Page</span>
      </div>
      <MenuList items={menuItems} />
      <LoadingSpinner isLoading={isSubmitting} message="로그아웃 처리 중입니다..." />
    </div>
  );
}
