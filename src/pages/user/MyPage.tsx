import clsx from "clsx";
import { useState } from "react";
import { logout as logoutApi } from "@/api/auth.api";
import { useAuthStore } from "@/stores/auth.store";
import { useNavigate } from "react-router-dom";
import MenuList from "@/components/common/lists/MenuList";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { FaUserCircle } from "react-icons/fa";

export default function MyPage() {
  const logoutStore = useAuthStore((state) => state.logout);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleWithdraw = () => {
    console.info("회원탈퇴 클릭");
  };

  const menuItems = [
    {
      label: "로그아웃",
      onClick: handleLogout,
      disabled: isSubmitting,
    },
    {
      label: "회원탈퇴",
      onClick: handleWithdraw,
      disabled: isSubmitting,
    },
  ];

  return (
    <div className={clsx("container")}>
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
