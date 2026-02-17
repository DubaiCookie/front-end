import clsx from "clsx";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAttractionDetail } from "@/api/attraction.api";
import { subscribeRideInfo } from "@/api/ws";
import type { AttractionDetail } from "@/types/attraction";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Button from "@/components/common/Button";
import AttractionContentCard from "@/components/attraction/AttractionContentCard";
import Modal from "@/components/common/modals/Modal";
import { useAuthStore } from "@/stores/auth.store";
import { enqueue } from "@/api/queue.api";
import type { EnqueueResponse } from "@/types/queue";
import styles from "./Attraction.module.css";

type QueueModalMode = "loginRequired" | "ticketUnavailable" | "queueConfirm" | "queueCompleted" | null;

export default function AttractionDetailPage() {
  const { attractionId } = useParams<{ attractionId: string }>();
  const [attraction, setAttraction] = useState<AttractionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnqueueLoading, setIsEnqueueLoading] = useState(false);
  const [detailRefreshKey, setDetailRefreshKey] = useState(0);
  const [modalMode, setModalMode] = useState<QueueModalMode>(null);
  const [enqueueResult, setEnqueueResult] = useState<EnqueueResponse | null>(null);
  const userId = useAuthStore((state) => state.userId);
  const hasTodayActiveTicket = useAuthStore((state) => state.hasTodayActiveTicket);
  const todayActiveTicketType = useAuthStore((state) => state.todayActiveTicketType);

  useEffect(() => {
    if (!attractionId) {
      return;
    }

    const fetchAttractionDetail = async () => {
      try {
        setIsLoading(true);
        const data = await getAttractionDetail(attractionId);
        setAttraction(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchAttractionDetail();
  }, [attractionId, detailRefreshKey]);

  useEffect(() => {
    if (!attractionId) {
      return;
    }

    const parsedRideId = Number(attractionId);
    if (Number.isNaN(parsedRideId)) {
      return;
    }

    const unsubscribe = subscribeRideInfo(parsedRideId, (payload) => {
      if (payload.rideId !== parsedRideId) {
        return;
      }

      setAttraction((prev) => {
        if (!prev || prev.attractionId !== parsedRideId) {
          return prev;
        }
        return {
          ...prev,
          waitTimes: payload.waitTimes,
        };
      });
    });

    return () => {
      unsubscribe();
    };
  }, [attractionId]);

  const premiumWaiting = attraction?.waitTimes.find((wait) => wait.ticketType === "PREMIUM");
  const generalWaiting = attraction?.waitTimes.find((wait) => wait.ticketType === "GENERAL");
  const selectedTypeWaiting =
    todayActiveTicketType
      ? attraction?.waitTimes.find((wait) => wait.ticketType === todayActiveTicketType)
      : null;

  const ridingMinutes = attraction ? Math.round(attraction.ridingTime / 60) : 0;
  const ticketTypeLabel = todayActiveTicketType === "PREMIUM" ? "Premium" : "Basic";

  const handleQueueButtonClick = () => {
    if (!userId) {
      setModalMode("loginRequired");
      return;
    }

    if (!hasTodayActiveTicket || !todayActiveTicketType) {
      setModalMode("ticketUnavailable");
      return;
    }

    setModalMode("queueConfirm");
  };

  const handleModalButtonClick = async () => {
    if (
      modalMode !== "queueConfirm" ||
      !attraction ||
      !userId ||
      !todayActiveTicketType
    ) {
      setModalMode(null);
      return;
    }

    try {
      setIsEnqueueLoading(true);
      const data = await enqueue({
        userId,
        rideId: attraction.attractionId,
        ticketType: todayActiveTicketType,
      });
      setEnqueueResult(data);
      setDetailRefreshKey((prev) => prev + 1);
      setModalMode("queueCompleted");
    } catch (error) {
      console.error(error);
      setModalMode(null);
    } finally {
      setIsEnqueueLoading(false);
    }
  };

  const isModalOpen = modalMode !== null;
  const modalTitle =
    modalMode === "loginRequired"
      ? "로그인이 필요합니다"
      : modalMode === "ticketUnavailable"
        ? "대기 불가"
        : modalMode === "queueConfirm"
          ? "줄서기"
          : "대기 등록 완료";

  const modalContent =
    modalMode === "loginRequired" ? (
      "로그인 후 줄서기를 이용할 수 있습니다."
    ) : modalMode === "ticketUnavailable" ? (
      "줄서기는 입장 후 가능합니다."
    ) : modalMode === "queueConfirm" ? (
      <div className={styles.queueModalContent}>
        <p>
          <span className={styles.emphasisPrimary}>{attraction?.name}</span>에 줄서기를 등록하시겠습니까?
        </p>
        <p
          className={clsx(
            styles.ticketTypeBadge,
            todayActiveTicketType === "PREMIUM" ? styles.ticketTypePremium : styles.ticketTypeBasic,
          )}
        >
          {ticketTypeLabel}
        </p>
        <p>
          예상 대기시간: <span className={styles.emphasisPrimary}>{selectedTypeWaiting?.estimatedWaitMinutes ?? 0}</span> 분
        </p>
      </div>
    ) : (
      <div className={styles.queueModalContent}>
        <p>
          <span className={styles.emphasisPrimary}>{attraction?.name}</span>에 대기가 등록되었습니다.
        </p>
        <p>내 순서: <span className={styles.emphasisPrimary}>{enqueueResult?.position ?? 0}</span>번째</p>
        <p>예상 대기시간: <span className={styles.emphasisPrimary}>{enqueueResult?.estimatedWaitMinutes ?? 0}</span> 분</p>
      </div>
    );

  return (
    <div className={clsx("container", styles.detailPage)}>
      <LoadingSpinner isLoading={isLoading || isEnqueueLoading} />
      <Modal
        isOpen={isModalOpen}
        title={modalTitle}
        content={modalContent}
        buttonTitle="확인"
        onClose={() => {
          setModalMode(null);
        }}
        onButtonClick={() => {
          void handleModalButtonClick();
        }}
      />

      {attraction && (
        <>
          <section className={styles.hero}>
            <img src={attraction.imageUrl} alt={attraction.name} className={styles.heroImage} />
            <div className={styles.heroGradient} />
          </section>

          <AttractionContentCard
            attraction={attraction}
            ridingMinutes={ridingMinutes}
            premiumWaitingMinutes={premiumWaiting?.estimatedWaitMinutes ?? 0}
            premiumWaitingCount={premiumWaiting?.waitingCount ?? 0}
            generalWaitingMinutes={generalWaiting?.estimatedWaitMinutes ?? 0}
            generalWaitingCount={generalWaiting?.waitingCount ?? 0}
          />
          <div className={styles.bottomSpacer} />

          <div className="button-bottom">
            <Button title="줄서기" className={styles.queueButton} onClick={handleQueueButtonClick} />
          </div>
        </>
      )}
    </div>
  );
}
