import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { MdFaceRetouchingNatural } from "react-icons/md";
import { IoCloudUploadOutline } from "react-icons/io5";
import { useAuthStore } from "@/stores/auth.store";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Modal from "@/components/common/modals/Modal";
import { getFaceStatus, registerFace, unregisterFace } from "@/api/ai.api";
import styles from "./FaceFindPage.module.css";

const MAX_PHOTOS = 5;

type RegisterState = "idle" | "registered" | "error";

export default function FaceFindPage() {
  const isLoggedIn = Boolean(useAuthStore((s) => s.nickname));

  const [registerState, setRegisterState] = useState<RegisterState>("idle");
  const [registeredCount, setRegisteredCount] = useState(0);
  const [selfieFiles, setSelfieFiles] = useState<File[]>([]);
  const [selfiePreviews, setSelfiePreviews] = useState<string[]>([]);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("처리 중입니다...");
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [infoModal, setInfoModal] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) return;
    (async () => {
      try {
        const s = await getFaceStatus();
        if (s.registered) {
          setRegisterState("registered");
          setRegisteredCount(s.total_photos);
        }
      } catch {
        // ignore
      }
    })();
  }, [isLoggedIn]);

  const handleSelfieInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []).slice(0, MAX_PHOTOS);
    if (picked.length === 0) return;
    selfiePreviews.forEach(URL.revokeObjectURL);
    setSelfieFiles(picked);
    setSelfiePreviews(picked.map((f) => URL.createObjectURL(f)));
  };

  const removeSelfie = (idx: number) => {
    URL.revokeObjectURL(selfiePreviews[idx]);
    setSelfieFiles((prev) => prev.filter((_, i) => i !== idx));
    setSelfiePreviews((prev) => prev.filter((_, i) => i !== idx));
    if (selfieInputRef.current) selfieInputRef.current.value = "";
  };

  const clearSelfies = () => {
    selfiePreviews.forEach(URL.revokeObjectURL);
    setSelfieFiles([]);
    setSelfiePreviews([]);
    if (selfieInputRef.current) selfieInputRef.current.value = "";
  };

  const handleRegister = async () => {
    if (selfieFiles.length === 0) return;
    try {
      setLoadingMsg("얼굴을 등록하는 중입니다...");
      setIsLoading(true);
      const res = await registerFace(selfieFiles, true);
      setRegisterState("registered");
      setRegisteredCount(res.total_photos);
      clearSelfies();
      setInfoModal(`얼굴 등록이 완료되었습니다. (${res.total_photos}장 등록)\n탑승 후 사진이 자동으로 인식됩니다.`);
    } catch (err: unknown) {
      console.error(err);
      setRegisterState("error");
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setErrorModal(detail ?? "얼굴 등록 중 오류가 발생했습니다. 정면 사진으로 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnregister = async () => {
    try {
      setLoadingMsg("등록 정보를 삭제하는 중입니다...");
      setIsLoading(true);
      await unregisterFace();
      setRegisterState("idle");
      setRegisteredCount(0);
      clearSelfies();
      setInfoModal("등록된 얼굴 정보가 삭제되었습니다.");
    } catch (err) {
      console.error(err);
      setErrorModal("삭제 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const registerStatusLabel =
    registerState === "registered"
      ? `얼굴 등록 완료 (${registeredCount}장)`
      : registerState === "error"
        ? "등록 실패 — 다시 시도해 주세요"
        : "아직 등록되지 않음";

  const dotVariant =
    registerState === "registered"
      ? ""
      : registerState === "error"
        ? styles.error
        : styles.unregistered;

  if (!isLoggedIn) {
    return (
      <div className={clsx("container", styles.pageRoot)}>
        <div className={clsx("page-title")}>
          <div className={clsx("glass", "title-icon-container")}>
            <MdFaceRetouchingNatural className={clsx("title-icon")} />
          </div>
          <span>얼굴 등록</span>
        </div>
        <div className={styles.stepCard}>
          <p className={styles.stepLabel}>로그인이 필요한 서비스입니다</p>
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--TEXT-SECONDARY)" }}>
            얼굴 인식 서비스를 이용하려면 먼저 로그인해 주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <LoadingSpinner isLoading={isLoading} message={loadingMsg} />

      <Modal
        isOpen={errorModal !== null}
        title="오류"
        content={errorModal ?? ""}
        buttonTitle="확인"
        onClose={() => setErrorModal(null)}
        onButtonClick={() => setErrorModal(null)}
      />
      <Modal
        isOpen={infoModal !== null}
        title="안내"
        content={infoModal ?? ""}
        buttonTitle="확인"
        onClose={() => setInfoModal(null)}
        onButtonClick={() => setInfoModal(null)}
      />

      <div className={clsx("container", styles.pageRoot)}>
        <div className={clsx("page-title")}>
          <div className={clsx("glass", "title-icon-container")}>
            <MdFaceRetouchingNatural className={clsx("title-icon")} />
          </div>
          <span>얼굴 등록</span>
        </div>

        <div className={styles.hintBox}>
          <p className={styles.hintTitle}>얼굴 등록 안내</p>
          <ul className={styles.hintList}>
            <li>얼굴이 잘 나온 정면 사진을 최대 5장 등록하세요.</li>
            <li>탑승 후 단체 사진에서 내 얼굴이 자동으로 인식됩니다.</li>
            <li>인식된 사진은 마이페이지 &gt; 내 탑승 사진에서 확인할 수 있습니다.</li>
          </ul>
        </div>

        <div className={styles.stepCard}>
          <p className={styles.stepLabel}>내 얼굴 등록</p>

          <div className={styles.statusRow}>
            <span className={clsx(styles.statusDot, dotVariant)} />
            <span>{registerStatusLabel}</span>
          </div>

          <div style={{ marginTop: 12 }}>
            {selfiePreviews.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {selfiePreviews.map((url, idx) => (
                  <div key={url} className={styles.previewWrap} style={{ width: 80, height: 80 }}>
                    <img
                      src={url}
                      alt={`등록할 사진 ${idx + 1}`}
                      className={styles.previewImg}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <button
                      type="button"
                      className={styles.previewClear}
                      onClick={() => removeSelfie(idx)}
                      aria-label={`사진 ${idx + 1} 삭제`}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {selfiePreviews.length < MAX_PHOTOS && (
                  <button
                    type="button"
                    className={styles.uploadArea}
                    style={{ width: 80, height: 80, minHeight: "unset" }}
                    onClick={() => selfieInputRef.current?.click()}
                    aria-label="사진 추가"
                  >
                    <IoCloudUploadOutline style={{ fontSize: 20 }} />
                    <span style={{ fontSize: 11 }}>추가</span>
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                className={styles.uploadArea}
                onClick={() => selfieInputRef.current?.click()}
                aria-label="셀피 선택"
              >
                <IoCloudUploadOutline className={styles.uploadIcon} />
                <span className={styles.uploadText}>정면 사진을 선택하세요 (최대 {MAX_PHOTOS}장)</span>
                <span className={styles.uploadHint}>JPG, PNG · 최대 10 MB · 여러 장 동시 선택 가능</span>
              </button>
            )}
          </div>

          <input
            ref={selfieInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={handleSelfieInputChange}
            aria-label="셀피 파일 선택"
          />

          <div className={styles.actionRow}>
            <button
              type="button"
              className={styles.btnPrimary}
              disabled={selfieFiles.length === 0 || isLoading}
              onClick={() => void handleRegister()}
            >
              얼굴 등록
            </button>
            {registerState === "registered" && (
              <button
                type="button"
                className={styles.btnSecondary}
                disabled={isLoading}
                onClick={() => void handleUnregister()}
              >
                등록 삭제
              </button>
            )}
          </div>
        </div>

        <div className={styles.bottomSpacer} />
      </div>
    </>
  );
}
