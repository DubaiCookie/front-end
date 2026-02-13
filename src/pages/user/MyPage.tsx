import clsx from "clsx";
import { useState } from "react";
import { logout as logoutApi } from "@/api/auth.api";
import { useAuthStore } from "@/stores/auth.store";
import Button from "@/components/common/Button";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

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
            navigate("/attraction", {
                replace: true,
                state: { showLogoutModal: true },
            });
        }
    };

    return (
        <div className={clsx("container")}>
            <div className={clsx('page-title')}>
                <div className={clsx('glass', 'title-icon-container')}>
                    <FaUserCircle className={clsx('title-icon')} />
                </div>
                <span>my ticket</span>
            </div>
            <Button
                title={isSubmitting ? "로그아웃 중..." : "로그아웃"}
                onClick={handleLogout}
                disabled={isSubmitting}
            />
        </div>
    );
}
