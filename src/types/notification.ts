/**
 * 알림 타입 식별자.
 *
 * RIDE_PHOTO_READY: 탑승 사진이 준비되었을 때 서버가 보내는 알림.
 * 이 타입은 알림 센터(NotificationPage)에만 표시하고
 * 포그라운드 팝업/토스트는 띄우지 않습니다.
 */
export type NotificationType =
  | "QUEUE_AVAILABLE"
  | "QUEUE_ALMOST_READY"
  | "RIDE_PHOTO_READY"
  | string;

/** 사진 알림 포그라운드 팝업을 억제할 타입 목록 */
export const SILENT_FOREGROUND_NOTIFICATION_TYPES: ReadonlySet<string> = new Set([
  "RIDE_PHOTO_READY",
]);

export interface UserNotification {
  notificationId: number;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
