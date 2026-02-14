import clsx from "clsx";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import WaitingList from "@/components/waiting/WaitingList";
import { useAuthStore } from "@/stores/auth.store";
import { getQueueStatus } from "@/api/queue.api";
import type { QueueStatusItem } from "@/types/queue";
import EmptyStateMessage from "@/components/common/EmptyStateMessage";
import styles from "./WaitingListPage.module.css";
import { IoHourglass } from "react-icons/io5";

export default function WaitingListPage() {
  const userId = useAuthStore((state) => state.userId);
  const [items, setItems] = useState<QueueStatusItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setItems([]);
      return;
    }

    const fetchQueueStatus = async () => {
      try {
        setIsLoading(true);
        const data = await getQueueStatus(userId);
        setItems(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchQueueStatus();
  }, [userId]);

  return (
    <div className={clsx("container", styles.pageRoot)}>
      <LoadingSpinner isLoading={isLoading} />
      <div className={clsx("page-title")}>
        <div className={clsx("glass", "title-icon-container")}>
          <IoHourglass className={clsx("title-icon")} />
        </div>
        <span>Waiting Status</span>
      </div>
      {items.length > 0 ? <WaitingList items={items} /> : <EmptyStateMessage target="이용 대기중인 어트랙션이" />}
    </div>
  );
}
