export type NotificationType = "QUEUE_AVAILABLE" | "QUEUE_ALMOST_READY" | string;

export interface UserNotification {
  notificationId: number;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
