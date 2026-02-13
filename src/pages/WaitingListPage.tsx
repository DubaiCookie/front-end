import clsx from "clsx";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import WaitingList from "@/components/waiting/WaitingList";
import { useAuthStore } from "@/stores/auth.store";
import { getQueueStatus } from "@/api/queue.api";
import type { QueueStatusItem } from "@/types/queue";

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
    <div className={clsx("container")}>
      <LoadingSpinner isLoading={isLoading} />
      <div className={clsx("page-title")}>
        Waiting Status
      </div>
      <WaitingList items={items} />
    </div>
  );
}
