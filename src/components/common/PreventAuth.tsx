import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";

type PreventAuthProps = {
  children: ReactNode;
};

export default function PreventAuth({ children }: PreventAuthProps) {
  const username = useAuthStore((state) => state.username);
  const isLoggedIn = Boolean(username);

  if (isLoggedIn) {
    return <Navigate to="/attraction" replace />;
  }

  return <>{children}</>;
}
