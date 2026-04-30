import clsx from "clsx";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MdPhotoCamera } from "react-icons/md";
import { useAuthStore } from "@/stores/auth.store";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Modal from "@/components/common/modals/Modal";
import { getMyAttractionImages, type AttractionImage } from "@/api/attraction-image.api";
import { preparePhotoPayment, cancelPaymentOrder } from "@/api/payment.api";
import { env } from "@/utils/env";
import styles from "./RidePhotosPage.module.css";

export default function RidePhotosPage() {
  const { cycleId } = useParams<{ cycleId: string }>();
  const nickname = useAuthStore((state) => state.nickname);

  const [photos, setPhotos] = useState<AttractionImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState("처리 중입니다...");
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    const id = Number(cycleId);
    if (!cycleId || !Number.isFinite(id) || id <= 0) {
      setFetchError("올바르지 않은 탑승 주기 ID입니다.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setFetchError(null);
    getMyAttractionImages(id)
      .then(setPhotos)
      .catch((err: unknown) => {
        console.error(err);
        setFetchError("사진을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
      })
      .finally(() => setIsLoading(false));
  }, [cycleId]);

  const loadTossScript = async () => {
    if (window.TossPayments) return window.TossPayments;

    await new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>('script[data-toss-sdk="true"]');
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("Toss SDK 로드에 실패했습니다.")), { once: true });
        return;
      }
      const script = document.createElement("script");
      script.src = "https://js.tosspayments.com/v1/payment";
      script.async = true;
      script.dataset.tossSdk = "true";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Toss SDK 로드에 실패했습니다."));
      document.body.appendChild(script);
    });

    if (!window.TossPayments) throw new Error("Toss SDK 초기화에 실패했습니다.");
    return window.TossPayments;
  };

  const handleBuyClick = async (photo: AttractionImage) => {
    const tossClientKey = env.TOSS_CLIENT_KEY;
    if (!tossClientKey) {
      setErrorModal("VITE_TOSS_CLIENT_KEY 설정이 필요합니다.");
      return;
    }

    try {
      setLoadingMsg("결제를 준비하는 중입니다...");
      setIsPaying(true);

      const prepared = await preparePhotoPayment({
        attractionImageId: photo.attractionImageId,
        orderName: "탑승 사진",
        amount: photo.price,
      });

      const amount = Number(prepared.amount);
      const backendOrderId = Number(prepared.orderId);
      const paymentId = Number(prepared.paymentId);
      const orderName = String(prepared.orderName ?? "").trim();
      const tossOrderId = String(prepared.tossOrderId ?? "").trim();

      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error(`유효하지 않은 결제 금액입니다. amount=${prepared.amount}`);
      }
      if (!Number.isFinite(backendOrderId) || backendOrderId <= 0) {
        throw new Error(`유효하지 않은 주문 번호입니다. orderId=${prepared.orderId}`);
      }
      if (!orderName) throw new Error("유효하지 않은 주문명입니다.");
      if (!/^[A-Za-z0-9_-]{6,64}$/.test(tossOrderId)) {
        throw new Error(`토스 주문번호 형식이 올바르지 않습니다. tossOrderId=${tossOrderId}`);
      }

      const TossPayments = await loadTossScript();
      const tossPayments = TossPayments(tossClientKey);
      const baseUrl = env.APP_BASE_URL || window.location.origin;
      const successUrl = `${baseUrl}/ticket/order/success?backendOrderId=${backendOrderId}`;
      const failUrl = `${baseUrl}/ticket/order/fail?backendOrderId=${backendOrderId}`;

      sessionStorage.setItem(
        "pending-payment",
        JSON.stringify({
          paymentId,
          orderId: backendOrderId,
          amount,
          tossOrderId,
        }),
      );

      try {
        await tossPayments.requestPayment("CARD", {
          amount,
          orderId: tossOrderId,
          orderName,
          successUrl,
          failUrl,
          customerName: nickname ?? undefined,
          windowTarget: "iframe",
          card: { flowMode: "DEFAULT" },
        });
      } catch (paymentWindowError) {
        await cancelPaymentOrder(backendOrderId).catch((cancelError: unknown) => {
          console.warn("결제 준비 주문 취소에 실패했습니다.", cancelError);
        });
        sessionStorage.removeItem("pending-payment");
        throw paymentWindowError;
      }
    } catch (error) {
      console.error(error);
      setErrorModal(
        error instanceof Error && error.message
          ? error.message
          : "결제 준비 중 오류가 발생했습니다.",
      );
    } finally {
      setIsPaying(false);
    }
  };

  const renderStatusBadge = (status: AttractionImage["analysisStatus"]) => {
    if (status === "COMPLETED") return null;
    if (status === "PENDING") {
      return (
        <span className={clsx(styles.statusBadge, styles.statusPending)}>
          분석 중
        </span>
      );
    }
    return (
      <span className={clsx(styles.statusBadge, styles.statusFailed)}>
        분석 실패
      </span>
    );
  };

  return (
    <>
      <LoadingSpinner isLoading={isLoading || isPaying} message={loadingMsg} />

      <Modal
        isOpen={errorModal !== null}
        title="오류"
        content={errorModal ?? ""}
        buttonTitle="확인"
        onClose={() => setErrorModal(null)}
        onButtonClick={() => setErrorModal(null)}
      />

      <div className={clsx("container", styles.pageRoot)}>
        <div className={clsx("page-title")}>
          <div className={clsx("glass", "title-icon-container")}>
            <MdPhotoCamera className={clsx("title-icon")} />
          </div>
          <span>Ride Photos</span>
        </div>

        <div className={styles.hintBox}>
          <p className={styles.hintTitle}>탑승 사진 구매 안내</p>
          <p>사진을 구매하면 마이페이지에서 언제든지 확인할 수 있습니다.</p>
        </div>

        {fetchError && (
          <div className={styles.errorCard} role="alert">
            {fetchError}
          </div>
        )}

        {!isLoading && !fetchError && photos.length === 0 && (
          <div className={styles.emptyCard}>
            <div className={styles.emptyIcon}>
              <MdPhotoCamera />
            </div>
            <p>이번 탑승에서 촬영된 사진이 없습니다.</p>
          </div>
        )}

        {photos.length > 0 && (
          <div className={styles.photoGrid}>
            {photos.map((photo) => {
              const thumbSrc = photo.thumbnailUrl ?? photo.imageUrl;
              const isReady = photo.analysisStatus === "COMPLETED";
              return (
                <div key={photo.attractionImageId} className={styles.photoCard}>
                  {thumbSrc ? (
                    <img
                      src={thumbSrc}
                      alt="탑승 사진 썸네일"
                      className={styles.photoThumb}
                    />
                  ) : (
                    <div
                      className={styles.photoThumbPlaceholder}
                      aria-label="사진 준비 중"
                    >
                      <MdPhotoCamera />
                    </div>
                  )}

                  <div className={styles.photoInfo}>
                    <div>
                      <span className={styles.photoPrice}>
                        {photo.price.toLocaleString()}
                        <span className={styles.photoPriceUnit}>원</span>
                      </span>
                      {renderStatusBadge(photo.analysisStatus)}
                    </div>
                    <button
                      type="button"
                      className={styles.photoBuyButton}
                      disabled={!isReady || isPaying}
                      onClick={() => { void handleBuyClick(photo); }}
                      aria-label={`${photo.price.toLocaleString()}원 사진 구매하기`}
                    >
                      {isPaying ? "처리 중..." : "구매하기"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className={styles.bottomSpacer} />
      </div>
    </>
  );
}
