import clsx from "clsx";
import { useEffect, useState } from "react";
import { logout as logoutApi } from "@/api/auth.api";
import { useAuthStore } from "@/stores/auth.store";
import { useNavigate } from "react-router-dom";
import MenuList from "@/components/common/lists/MenuList";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { FaUserCircle } from "react-icons/fa";
import { MdPhotoCamera } from "react-icons/md";
import Modal from "@/components/common/modals/Modal";
import { unregisterStoredPushToken } from "@/lib/push-notification";
import { getMyRidePhotos } from "@/api/ride-photo.api";
import type { RidePhoto } from "@/types/user";
import myPageStyles from "./MyPage.module.css";

export default function MyPage() {
  const logoutStore = useAuthStore((state) => state.logout);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreparingModalOpen, setIsPreparingModalOpen] = useState(false);
  const [selectedMenuLabel, setSelectedMenuLabel] = useState("");
  const navigate = useNavigate();

  const [ridePhotos, setRidePhotos] = useState<RidePhoto[]>([]);
  const [photosLoading, setPhotosLoading] = useState(true);
  const [photosError, setPhotosError] = useState<string | null>(null);

  useEffect(() => {
    setPhotosLoading(true);
    setPhotosError(null);
    getMyRidePhotos()
      .then(setRidePhotos)
      .catch((err: unknown) => {
        console.error(err);
        setPhotosError("탑승 사진을 불러오지 못했습니다.");
      })
      .finally(() => setPhotosLoading(false));
  }, []);

  const handleLogout = async () => {
    try {
      setIsSubmitting(true);
      await unregisterStoredPushToken();
      await logoutApi();
    } catch (error) {
      console.error(error);
    } finally {
      logoutStore();
      setIsSubmitting(false);
      navigate("/attraction", { replace: true });
    }
  };

  const openPreparingModal = (label: string) => {
    setSelectedMenuLabel(label);
    setIsPreparingModalOpen(true);
  };

  const menuItems = [
    {
      label: "내 탑승 사진",
      onClick: () => navigate("/my-photos"),
      disabled: isSubmitting,
    },
    {
      label: "얼굴 등록",
      onClick: () => navigate("/face-find"),
      disabled: isSubmitting,
    },
    {
      label: "결제 내역",
      onClick: () => openPreparingModal("결제 내역"),
      disabled: isSubmitting,
    },
    {
      label: "티켓 사용 내역",
      onClick: () => openPreparingModal("티켓 사용 내역"),
      disabled: isSubmitting,
    },
    {
      label: "결제 수단 관리",
      onClick: () => openPreparingModal("결제 수단 관리"),
      disabled: isSubmitting,
    },
    {
      label: "알림 설정",
      onClick: () => openPreparingModal("알림 설정"),
      disabled: isSubmitting,
    },
    {
      label: "공지사항",
      onClick: () => openPreparingModal("공지사항"),
      disabled: isSubmitting,
    },
    {
      label: "자주 묻는 질문",
      onClick: () => openPreparingModal("자주 묻는 질문"),
      disabled: isSubmitting,
    },
    {
      label: "로그아웃",
      onClick: handleLogout,
      disabled: isSubmitting,
    },
    {
      label: "회원 탈퇴",
      onClick: () => openPreparingModal("회원 탈퇴"),
      disabled: isSubmitting,
    },
  ];

  return (
    <div className={clsx("container")}>
      <Modal
        isOpen={isPreparingModalOpen}
        title="준비중"
        content={`${selectedMenuLabel} 기능은 준비중입니다.`}
        buttonTitle="확인"
        onClose={() => {
          setIsPreparingModalOpen(false);
          setSelectedMenuLabel("");
        }}
        onButtonClick={() => {
          setIsPreparingModalOpen(false);
          setSelectedMenuLabel("");
        }}
      />
      <div className={clsx('page-title')}>
        <div className={clsx('glass', 'title-icon-container')}>
          <FaUserCircle className={clsx('title-icon')} />
        </div>
        <span>My Page</span>
      </div>
      <MenuList items={menuItems} />

      {/* 탑승 사진 섹션 */}
      <section className={myPageStyles.photoSection}>
        <div className={myPageStyles.photoSectionHeader}>
          <MdPhotoCamera className={myPageStyles.photoSectionIcon} />
          <h2 className={myPageStyles.photoSectionTitle}>구매한 탑승 사진</h2>
        </div>

        {photosLoading && (
          <p className={myPageStyles.photoSectionMessage}>불러오는 중...</p>
        )}

        {!photosLoading && photosError && (
          <p className={clsx(myPageStyles.photoSectionMessage, myPageStyles.photoSectionError)}>
            {photosError}
          </p>
        )}

        {!photosLoading && !photosError && ridePhotos.length === 0 && (
          <p className={myPageStyles.photoSectionMessage}>구매한 탑승 사진이 없습니다.</p>
        )}

        {!photosLoading && !photosError && ridePhotos.length > 0 && (
          <div className={myPageStyles.photoGrid}>
            {ridePhotos.map((photo) => (
              <div key={photo.ridePhotoId} className={myPageStyles.photoCard}>
                <img
                  src={photo.imageUrl}
                  alt={`${photo.attractionName} 탑승 사진`}
                  className={myPageStyles.photoImg}
                />
                <div className={myPageStyles.photoMeta}>
                  <span className={myPageStyles.photoAttractionName}>
                    {photo.attractionName}
                  </span>
                  <span className={myPageStyles.photoDate}>
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
      </section>

      <LoadingSpinner isLoading={isSubmitting} message="로그아웃 처리 중입니다..." />
    </div>
  );
}
