import clsx from "clsx";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdPhotoCamera } from "react-icons/md";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { getMyPhotoCycles, type MyPhotoCycle } from "@/api/attraction-image.api";
import styles from "./MyPhotosPage.module.css";

export default function MyPhotosPage() {
  const navigate = useNavigate();

  const [cycles, setCycles] = useState<MyPhotoCycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setFetchError(null);
    getMyPhotoCycles()
      .then(setCycles)
      .catch((err: unknown) => {
        console.error(err);
        setFetchError("탑승 회차 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const formatRideDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const handleCardClick = (cycleId: number) => {
    navigate(`/ride-photos/${cycleId}`);
  };

  const handleCardKeyDown = (e: React.KeyboardEvent, cycleId: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick(cycleId);
    }
  };

  return (
    <>
      <LoadingSpinner isLoading={isLoading} message="불러오는 중입니다..." />

      <div className={clsx("container", styles.pageRoot)}>
        <div className={clsx("page-title")}>
          <div className={clsx("glass", "title-icon-container")}>
            <MdPhotoCamera className={clsx("title-icon")} />
          </div>
          <span>My Ride Photos</span>
        </div>

        {fetchError && (
          <div className={styles.errorCard} role="alert">
            {fetchError}
          </div>
        )}

        {!isLoading && !fetchError && cycles.length === 0 && (
          <div className={styles.emptyCard}>
            <div className={styles.emptyIcon}>
              <MdPhotoCamera />
            </div>
            <p>탑승 사진이 없습니다.</p>
            <p className={styles.emptyDesc}>
              놀이기구를 탑승하면 사진이 자동으로 등록됩니다.
            </p>
          </div>
        )}

        {!isLoading && !fetchError && cycles.length > 0 && (
          <div className={styles.cycleGrid}>
            {cycles.map((cycle) => (
              <div
                key={cycle.attractionCycleId}
                className={styles.cycleCard}
                role="button"
                tabIndex={0}
                aria-label={`${cycle.attractionName} ${cycle.cycleNumber}회차 사진 보기`}
                onClick={() => handleCardClick(cycle.attractionCycleId)}
                onKeyDown={(e) => handleCardKeyDown(e, cycle.attractionCycleId)}
              >
                {cycle.thumbnailUrl ? (
                  <img
                    src={cycle.thumbnailUrl}
                    alt={`${cycle.attractionName} ${cycle.cycleNumber}회차 썸네일`}
                    className={styles.thumb}
                  />
                ) : (
                  <div
                    className={styles.thumbPlaceholder}
                    aria-label="썸네일 없음"
                  >
                    <MdPhotoCamera />
                  </div>
                )}

                <div className={styles.cardBody}>
                  <div className={styles.cardMeta}>
                    <span className={styles.attractionName}>
                      {cycle.attractionName}
                    </span>
                    <span className={styles.rideDateCycle}>
                      {formatRideDate(cycle.rideDate)} · {cycle.cycleNumber}회차
                    </span>
                  </div>

                  <span className={styles.photoBadge}>
                    사진 {cycle.photoCount}장
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className={styles.bottomSpacer} />
      </div>
    </>
  );
}
