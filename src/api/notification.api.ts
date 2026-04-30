import { http } from "@/api/http";
import type { UserNotification } from "@/types/notification";

type NotificationDto = {
  notificationId?: number;
  type?: string;
  title?: string;
  message?: string;
  isRead?: boolean;
  read?: boolean;
  createdAt?: string;
};

function mapNotification(dto: NotificationDto): UserNotification {
  return {
    notificationId: dto.notificationId ?? 0,
    type: dto.type ?? "",
    title: dto.title ?? "",
    message: dto.message ?? "",
    isRead: dto.isRead ?? dto.read ?? false,
    createdAt: dto.createdAt ?? "",
  };
}

export async function getMyNotifications() {
  const { data } = await http.get<NotificationDto[]>("/user/notifications/my");
  return data.map(mapNotification);
}

export async function markNotificationsAsRead(notificationIds?: number[]) {
  const { data } = await http.post("/user/notifications/read", {
    notificationIds: notificationIds ?? [],
  });
  return data;
}
