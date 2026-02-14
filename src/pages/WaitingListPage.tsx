import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import WaitingList from "@/components/waiting/WaitingList";
import { useAuthStore } from "@/stores/auth.store";
import { cancelQueue, getQueueStatus } from "@/api/queue.api";
import type { QueueStatusItem } from "@/types/queue";
import EmptyStateMessage from "@/components/common/EmptyStateMessage";
import styles from "./WaitingListPage.module.css";
import { IoHourglass } from "react-icons/io5";
import Modal from "@/components/common/modals/Modal";

export default function WaitingListPage() {
  const userId = useAuthStore((state) => state.userId);
  const [items, setItems] = useState<QueueStatusItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCancelItem, setSelectedCancelItem] = useState<QueueStatusItem | null>(null);

  const fetchQueueStatus = useCallback(async () => {
    if (!userId) {
      setItems([]);
      return;
    }

    try {
      setIsLoading(true);
      const data = await getQueueStatus(userId);
      setItems(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void fetchQueueStatus();
  }, [fetchQueueStatus]);

  const handleCancel = (item: QueueStatusItem) => {
    setSelectedCancelItem(item);
  };

  const handleConfirmCancel = async () => {
    if (!userId) {
      setSelectedCancelItem(null);
      return;
    }

    if (!selectedCancelItem) {
      return;
    }

    try {
      setIsLoading(true);
      await cancelQueue({
        userId,
        rideId: selectedCancelItem.rideId,
      });
      await fetchQueueStatus();
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    } finally {
      setSelectedCancelItem(null);
    }
  };

  return (
    <div className={clsx("container", styles.pageRoot)}>
      <LoadingSpinner isLoading={isLoading} />
      <Modal
        isOpen={Boolean(selectedCancelItem)}
        title="줄서기 취소"
        content={`${selectedCancelItem?.rideName ?? ""} 줄서기를 취소하시겠습니까?`}
        buttonTitle="확인"
        onClose={() => {
          setSelectedCancelItem(null);
        }}
        onButtonClick={() => {
          void handleConfirmCancel();
        }}
      />
      <div className={clsx("page-title")}>
        <div className={clsx("glass", "title-icon-container")}>
          <IoHourglass className={clsx("title-icon")} />
        </div>
        <span>Waiting Status</span>
      </div>
      {items.length > 0 ? (
        <WaitingList items={items} onCancel={handleCancel} />
      ) : (
        <EmptyStateMessage target="이용 대기중인 어트랙션이" />
      )}
    </div>
  );
}
