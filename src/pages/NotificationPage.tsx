import clsx from "clsx";
import { useCallback, useEffect, useMemo, useState } from "react";
import { IoNotifications } from "react-icons/io5";
import { getMyNotifications, markNotificationsAsRead } from "@/api/notification.api";
import EmptyStateMessage from "@/components/common/EmptyStateMessage";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import type { UserNotification } from "@/types/notification";
import styles from "./NotificationPage.module.css";

function formatNotificationTime(value: string) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getBadgeLabel(type: string) {
  if (type === "QUEUE_AVAILABLE") return "탑승 가능";
  if (type === "QUEUE_ALMOST_READY") return "곧 차례";
  return "알림";
}

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const unreadIds = useMemo(
    () => notifications.filter((item) => !item.isRead).map((item) => item.notificationId),
    [notifications],
  );

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setNotifications(await getMyNotifications());
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  const handleReadAll = async () => {
    if (unreadIds.length === 0) return;

    try {
      setIsLoading(true);
      await markNotificationsAsRead(unreadIds);
      await fetchNotifications();
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <div className={clsx("container", styles.pageRoot)}>
      <LoadingSpinner isLoading={isLoading} />
      <div className="page-title">
        <div className={clsx("glass", "title-icon-container")}>
          <IoNotifications className="title-icon" />
        </div>
        <span>Notifications</span>
      </div>

      {notifications.length > 0 ? (
        <>
          <div className={styles.toolbar}>
            <button type="button" className={styles.readButton} onClick={() => { void handleReadAll(); }}>
              모두 읽음
            </button>
          </div>
          <div className={styles.list}>
            {notifications.map((item) => (
              <article
                key={item.notificationId}
                className={clsx(styles.item, !item.isRead && styles.itemUnread)}
              >
                <header className={styles.itemHeader}>
                  <strong className={styles.title}>{item.title}</strong>
                  <span className={styles.badge}>{getBadgeLabel(item.type)}</span>
                </header>
                <p className={styles.message}>{item.message}</p>
                <time className={styles.time}>{formatNotificationTime(item.createdAt)}</time>
              </article>
            ))}
          </div>
        </>
      ) : (
        <EmptyStateMessage target="받은 알림이" />
      )}
    </div>
  );
}
