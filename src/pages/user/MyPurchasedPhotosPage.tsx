import clsx from "clsx";
import { useEffect, useState } from "react";
import { MdCheckCircle, MdPhotoLibrary } from "react-icons/md";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { getMyRidePhotos } from "@/api/ride-photo.api";
import type { RidePhoto } from "@/types/user";
import styles from "./MyPurchasedPhotosPage.module.css";

export default function MyPurchasedPhotosPage() {
  const [photos, setPhotos] = useState<RidePhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    getMyRidePhotos()
      .then(setPhotos)
      .catch((err: unknown) => {
        console.error(err);
        setFetchError("구매한 탑승 사진을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <>
      <LoadingSpinner isLoading={isLoading} message="불러오는 중입니다..." />

      {previewUrl && (
        <div
          className={styles.lightboxBackdrop}
          onClick={() => setPreviewUrl(null)}
          role="dialog"
          aria-label="사진 원본 보기"
        >
          <img src={previewUrl} alt="구매한 탑승 사진 원본" className={styles.lightboxImg} />
        </div>
      )}

      <div className={clsx("container", styles.pageRoot)}>
        <div className={clsx("page-title")}>
          <div className={clsx("glass", "title-icon-container")}>
            <MdPhotoLibrary className={clsx("title-icon")} />
          </div>
          <span>Purchased Photos</span>
        </div>

        <div className={styles.hintBox}>
          <p className={styles.hintTitle}>구매한 탑승 사진</p>
          <p>이미지를 클릭하면 원본 해상도로 크게 볼 수 있습니다.</p>
        </div>

        {fetchError && (
          <div className={styles.errorCard} role="alert">
            {fetchError}
          </div>
        )}

        {!isLoading && !fetchError && photos.length === 0 && (
          <div className={styles.emptyCard}>
            <div className={styles.emptyIcon}>
              <MdPhotoLibrary />
            </div>
            <p>구매한 탑승 사진이 없습니다.</p>
            <p className={styles.emptyDesc}>
              내 탑승 사진에서 마음에 드는 단체사진을 구매해 보세요.
            </p>
          </div>
        )}

        {photos.length > 0 && (
          <div className={styles.photoGrid}>
            {photos.map((photo) => (
              <div key={photo.ridePhotoId} className={styles.photoCard}>
                <div className={styles.photoPreviewWrapper}>
                  <img
                    src={photo.imageUrl}
                    alt={`${photo.attractionName} 탑승 사진`}
                    className={styles.photoImg}
                    onClick={() => setPreviewUrl(photo.imageUrl)}
                  />
                  <div className={styles.photoPurchasedBadge}>
                    <MdCheckCircle />
                    구매 완료
                  </div>
                </div>
                <div className={styles.photoMeta}>
                  <span className={styles.attractionName}>{photo.attractionName}</span>
                  <span className={styles.photoDate}>
                    {new Date(photo.rideDate).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
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
