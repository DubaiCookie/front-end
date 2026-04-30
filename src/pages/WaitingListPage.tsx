import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import WaitingList from "@/components/waiting/WaitingList";
import { useAuthStore } from "@/stores/auth.store";
import { boardQueue, cancelQueue, deferQueue, getQueueStatus } from "@/api/queue.api";
import type { QueueStatusItem } from "@/types/queue";
import EmptyStateMessage from "@/components/common/EmptyStateMessage";
import styles from "./WaitingListPage.module.css";
import { IoHourglass } from "react-icons/io5";
import Modal from "@/components/common/modals/Modal";
import { useQueueStore } from "@/stores/queue.store";

export default function WaitingListPage() {
  const userId = useAuthStore((state) => state.userId);
  const liveQueueItems = useQueueStore((state) => state.liveQueueItems);
  const [items, setItems] = useState<QueueStatusItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCancelItem, setSelectedCancelItem] = useState<QueueStatusItem | null>(null);
  const [selectedSnoozeItem, setSelectedSnoozeItem] = useState<QueueStatusItem | null>(null);
  const [selectedBoardItem, setSelectedBoardItem] = useState<QueueStatusItem | null>(null);

  const fetchQueueStatus = useCallback(async () => {
    if (!userId) {
      setItems([]);
      return;
    }

    try {
      setIsLoading(true);
      const data = await getQueueStatus();
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

  useEffect(() => {
    if (!userId) {
      return;
    }
    setItems(liveQueueItems);
  }, [liveQueueItems, userId]);

  const handleCancel = (item: QueueStatusItem) => {
    setSelectedCancelItem(item);
  };

  const handleSnooze = (item: QueueStatusItem) => {
    setSelectedSnoozeItem(item);
  };

  const handleBoard = (item: QueueStatusItem) => {
    setSelectedBoardItem(item);
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
        attractionId: selectedCancelItem.attractionId,
      });
      await fetchQueueStatus();
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    } finally {
      setSelectedCancelItem(null);
    }
  };

  const handleConfirmSnooze = async () => {
    if (!userId || !selectedSnoozeItem) {
      setSelectedSnoozeItem(null);
      return;
    }

    try {
      setIsLoading(true);
      await deferQueue({
        userId,
        attractionId: selectedSnoozeItem.attractionId,
      });
      await fetchQueueStatus();
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    } finally {
      setSelectedSnoozeItem(null);
    }
  };

  const handleConfirmBoard = async () => {
    if (!userId || !selectedBoardItem) {
      setSelectedBoardItem(null);
      return;
    }

    try {
      setIsLoading(true);
      await boardQueue({
        userId,
        attractionId: selectedBoardItem.attractionId,
      });
      await fetchQueueStatus();
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    } finally {
      setSelectedBoardItem(null);
    }
  };

  return (
    <div className={clsx("container", styles.pageRoot)}>
      <LoadingSpinner isLoading={isLoading} />
      <Modal
        isOpen={Boolean(selectedCancelItem)}
        title="줄서기 취소"
        content={`${selectedCancelItem?.attractionName ?? ""} 줄서기를 취소하시겠습니까?`}
        buttonTitle="확인"
        onClose={() => {
          setSelectedCancelItem(null);
        }}
        onButtonClick={() => {
          void handleConfirmCancel();
        }}
      />
      <Modal
        isOpen={Boolean(selectedSnoozeItem)}
        title="탑승 미루기"
        content={`${selectedSnoozeItem?.attractionName ?? ""} 탑승을 뒤로 미루시겠습니까?`}
        buttonTitle="확인"
        onClose={() => {
          setSelectedSnoozeItem(null);
        }}
        onButtonClick={() => {
          void handleConfirmSnooze();
        }}
      />
      <Modal
        isOpen={Boolean(selectedBoardItem)}
        title="탑승"
        content={`${selectedBoardItem?.attractionName ?? ""} 탑승을 완료하시겠습니까?`}
        buttonTitle="확인"
        onClose={() => {
          setSelectedBoardItem(null);
        }}
        onButtonClick={() => {
          void handleConfirmBoard();
        }}
      />
      <div className={clsx("page-title")}>
        <div className={clsx("glass", "title-icon-container")}>
          <IoHourglass className={clsx("title-icon")} />
        </div>
        <span>Waiting Status</span>
      </div>
      {items.length > 0 ? (
        <WaitingList items={items} onCancel={handleCancel} onSnooze={handleSnooze} onBoard={handleBoard} />
      ) : (
        <EmptyStateMessage target="이용 대기중인 어트랙션이" />
      )}
    </div>
  );
}
