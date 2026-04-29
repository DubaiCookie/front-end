import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";

type PreventAuthProps = {
  children: ReactNode;
};

export default function PreventAuth({ children }: PreventAuthProps) {
  const nickname = useAuthStore((state) => state.nickname);
  const isLoggedIn = Boolean(nickname);

  if (isLoggedIn) {
    return <Navigate to="/attraction" replace />;
  }

  return <>{children}</>;
}
