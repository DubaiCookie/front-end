import clsx from "clsx";
import { useState } from "react";
import { logout as logoutApi } from "@/api/auth.api";
import { useAuthStore } from "@/stores/auth.store";
import Button from "@/components/common/Button";

export default function MyPage() {
    const logoutStore = useAuthStore((state) => state.logout);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLogout = async () => {
        try {
            setIsSubmitting(true);
            await logoutApi();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={clsx("container")}>
            <div className={clsx("page-title")}>my page</div>
            <Button
                title={isSubmitting ? "로그아웃 중..." : "로그아웃"}
                onClick={handleLogout}
                disabled={isSubmitting}
            />
        </div>
    );
}
