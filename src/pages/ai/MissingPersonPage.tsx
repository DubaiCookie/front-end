import clsx from "clsx";
import { useCallback, useEffect, useRef, useState } from "react";
import { MdChildCare } from "react-icons/md";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Modal from "@/components/common/modals/Modal";
import {
  createMissingPersonSession,
  lockCandidate,
  getSessionStatus,
  markSessionFound,
  requestStaff,
  endSession,
} from "@/api/ai.api";
import type {
  SessionCreateResponse,
  SessionSummary,
  ClothingQuery,
  PersonDetection,
  CCTVSummary,
} from "@/types/ai";
import styles from "./MissingPersonPage.module.css";

// ── Types ────────────────────────────────────────────────────────────────────

type FormValues = {
  description: string;
  name: string;
  phone: string;
  relationship: string;
  child_name: string;
  child_age: string;
};

const EMPTY_FORM: FormValues = {
  description: "",
  name: "",
  phone: "",
  relationship: "",
  child_name: "",
  child_age: "",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildClothingTags(c: ClothingQuery): string[] {
  const tags: string[] = [];
  if (c.outer_upper_color || c.outer_upper_type) {
    tags.push(`${c.outer_upper_color ?? ""} ${c.outer_upper_type ?? "겉옷"}`.trim());
  }
  if (c.upper_color || c.upper_type) {
    tags.push(`${c.upper_color ?? ""} ${c.upper_type ?? "상의"}`.trim());
  }
  if (c.lower_color || c.lower_type) {
    tags.push(`${c.lower_color ?? ""} ${c.lower_type ?? "하의"}`.trim());
  }
  if (c.estimated_height_cm) {
    tags.push(`키 약 ${c.estimated_height_cm}cm`);
  }
  if (c.additional_description) {
    tags.push(c.additional_description);
  }
  return tags;
}

function stateLabel(state: string) {
  switch (state) {
    case "detecting": return "탐지 중";
    case "tracking": return "추적 중";
    case "found": return "발견 완료";
    case "expired": return "만료";
    default: return state;
  }
}

function stateBadgeClass(state: string) {
  switch (state) {
    case "detecting": return styles.statusDetecting;
    case "tracking": return styles.statusTracking;
    case "found": return styles.statusFound;
    default: return styles.statusExpired;
  }
}

// ── Component ────────────────────────────────────────────────────────────────

export default function MissingPersonPage() {
  const [form, setForm] = useState<FormValues>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Partial<FormValues>>({});

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("처리 중입니다...");
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [infoModal, setInfoModal] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    content: string;
    onConfirm: () => void;
  } | null>(null);

  // Session state
  const [session, setSession] = useState<SessionCreateResponse | null>(null);
  const [summary, setSummary] = useState<SessionSummary | null>(null);

  // Polling
  const pollTimerRef = useRef<number | null>(null);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current !== null) {
      window.clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const startPolling = useCallback(
    (sessionId: string) => {
      stopPolling();
      pollTimerRef.current = window.setInterval(async () => {
        try {
          const data = await getSessionStatus(sessionId);
          setSummary(data);
          // 세션 종료 상태이면 폴링 중단
          if (data.state === "found" || data.state === "expired") {
            stopPolling();
          }
        } catch {
          // 세션이 없어졌을 경우 폴링 중단
          stopPolling();
        }
      }, 2000);
    },
    [stopPolling],
  );

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  // ── Form helpers ──────────────────────────────────────────────

  const updateField = (field: keyof FormValues, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateForm = (): boolean => {
    const errors: Partial<FormValues> = {};
    if (!form.description.trim()) {
      errors.description = "아이의 인상착의를 입력해 주세요.";
    }
    if (!form.name.trim()) {
      errors.name = "신고자 이름을 입력해 주세요.";
    }
    if (!form.phone.trim()) {
      errors.phone = "연락처를 입력해 주세요.";
    }
    if (!form.relationship.trim()) {
      errors.relationship = "관계를 입력해 주세요. (예: 부모, 조부모)";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Session actions ───────────────────────────────────────────

  const handleStartSession = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoadingMsg("미아 탐지 세션을 시작하는 중입니다...");
      setIsLoading(true);
      const res = await createMissingPersonSession({
        description: form.description,
        requester: {
          name: form.name,
          phone: form.phone,
          relationship: form.relationship,
          child_name: form.child_name || null,
          child_age: form.child_age ? Number(form.child_age) : null,
        },
      });
      setSession(res);
      setSummary(null);
      startPolling(res.session_id);
    } catch (err: unknown) {
      console.error(err);
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setErrorModal(detail ?? "세션 시작 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLock = async (cctvId: string, trackId: number) => {
    if (!session) {
      return;
    }

    try {
      setLoadingMsg("추적을 시작하는 중입니다...");
      setIsLoading(true);
      await lockCandidate(session.session_id, { cctv_id: cctvId, track_id: trackId });
      setInfoModal("선택한 인물 추적을 시작합니다.");
    } catch (err: unknown) {
      console.error(err);
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setErrorModal(detail ?? "추적 시작 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestStaff = () => {
    if (!session) {
      return;
    }

    setConfirmModal({
      title: "직원 도움 요청",
      content: "현장 직원에게 미아 수색 요청을 보내시겠습니까?",
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          setLoadingMsg("직원에게 요청 중입니다...");
          setIsLoading(true);
          await requestStaff(session.session_id);
          setInfoModal("직원에게 요청이 전송되었습니다.");
        } catch (err: unknown) {
          console.error(err);
          const detail =
            (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
          setErrorModal(detail ?? "직원 요청 중 오류가 발생했습니다.");
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const handleFound = () => {
    if (!session) {
      return;
    }

    setConfirmModal({
      title: "아이를 찾았나요?",
      content: "아이와 직접 만났다면 이 버튼을 눌러 세션을 종료합니다.",
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          setLoadingMsg("세션을 종료하는 중입니다...");
          setIsLoading(true);
          await markSessionFound(session.session_id);
          stopPolling();
          setInfoModal("세션이 종료되었습니다. 아이를 찾아서 다행입니다.");
          const updated = await getSessionStatus(session.session_id);
          setSummary(updated);
        } catch (err: unknown) {
          console.error(err);
          setErrorModal("세션 종료 중 오류가 발생했습니다.");
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const handleEndSession = () => {
    if (!session) {
      return;
    }

    setConfirmModal({
      title: "탐지 종료",
      content: "진행 중인 미아 탐지 세션을 강제 종료하시겠습니까?",
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          setLoadingMsg("세션을 종료하는 중입니다...");
          setIsLoading(true);
          await endSession(session.session_id);
          stopPolling();
          setSession(null);
          setSummary(null);
          setForm(EMPTY_FORM);
        } catch (err: unknown) {
          console.error(err);
          setErrorModal("세션 종료 중 오류가 발생했습니다.");
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const isSessionActive =
    session && summary && summary.state !== "found" && summary.state !== "expired";

  // ── Render ────────────────────────────────────────────────────

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
      <Modal
        isOpen={confirmModal !== null}
        title={confirmModal?.title ?? ""}
        content={confirmModal?.content ?? ""}
        buttonTitle="확인"
        onClose={() => setConfirmModal(null)}
        onButtonClick={() => confirmModal?.onConfirm()}
      />

      <div className={clsx("container", styles.pageRoot)}>
        <div className={clsx("page-title")}>
          <div className={clsx("glass", "title-icon-container")}>
            <MdChildCare className={clsx("title-icon")} />
          </div>
          <span>Missing Child</span>
        </div>

        {/* ── 진행 중인 세션 없음: 신고 폼 ── */}
        {!session && (
          <>
            <div className={styles.hintBox}>
              <p className={styles.hintTitle}>AI 미아 찾기 서비스</p>
              <ul className={styles.hintList}>
                <li>아이의 인상착의를 자연어로 입력하면 AI가 분석합니다.</li>
                <li>CCTV 영상에서 조건에 맞는 후보를 실시간으로 탐지합니다.</li>
                <li>후보를 선택하면 해당 인물을 지속 추적합니다.</li>
              </ul>
            </div>

            {/* 아이 인상착의 */}
            <div className={styles.card}>
              <p className={styles.cardTitle}>아이 인상착의</p>
              <div className={styles.fieldGroup}>
                <div className={styles.fieldRow}>
                  <label className={styles.label}>인상착의 설명 *</label>
                  <textarea
                    className={styles.textarea}
                    placeholder="예: 13세 남자아이, 137cm, 흰색 티셔츠에 청바지, 파란 운동화"
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    rows={3}
                  />
                  {formErrors.description && (
                    <span className={styles.fieldError}>{formErrors.description}</span>
                  )}
                </div>
              </div>
            </div>

            {/* 신고자 정보 */}
            <div className={styles.card}>
              <p className={styles.cardTitle}>신고자 정보</p>
              <div className={styles.fieldGroup}>
                <div className={styles.fieldRowInline}>
                  <div className={styles.fieldRow}>
                    <label className={styles.label}>이름 *</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="홍길동"
                      value={form.name}
                      onChange={(e) => updateField("name", e.target.value)}
                    />
                    {formErrors.name && (
                      <span className={styles.fieldError}>{formErrors.name}</span>
                    )}
                  </div>
                  <div className={styles.fieldRow}>
                    <label className={styles.label}>관계 *</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="부모"
                      value={form.relationship}
                      onChange={(e) => updateField("relationship", e.target.value)}
                    />
                    {formErrors.relationship && (
                      <span className={styles.fieldError}>{formErrors.relationship}</span>
                    )}
                  </div>
                </div>

                <div className={styles.fieldRow}>
                  <label className={styles.label}>연락처 *</label>
                  <input
                    type="tel"
                    className={styles.input}
                    placeholder="010-0000-0000"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                  />
                  {formErrors.phone && (
                    <span className={styles.fieldError}>{formErrors.phone}</span>
                  )}
                </div>

                <div className={styles.fieldRowInline}>
                  <div className={styles.fieldRow}>
                    <label className={styles.label}>아이 이름</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="(선택)"
                      value={form.child_name}
                      onChange={(e) => updateField("child_name", e.target.value)}
                    />
                  </div>
                  <div className={styles.fieldRow}>
                    <label className={styles.label}>나이</label>
                    <input
                      type="number"
                      className={styles.input}
                      placeholder="(선택)"
                      min={1}
                      max={20}
                      value={form.child_age}
                      onChange={(e) => updateField("child_age", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                className={styles.btnPrimary}
                disabled={isLoading}
                onClick={() => void handleStartSession()}
              >
                미아 탐지 시작
              </button>
            </div>
          </>
        )}

        {/* ── 세션 진행 중 ── */}
        {session && (
          <>
            {/* 세션 상태 헤더 */}
            <div className={styles.card}>
              <p className={styles.cardTitle}>탐지 세션</p>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span
                  className={clsx(
                    styles.statusBadge,
                    summary ? stateBadgeClass(summary.state) : styles.statusDetecting,
                  )}
                >
                  {(summary?.state === "detecting" || summary?.state === "tracking") && (
                    <span className={styles.statusPulse} />
                  )}
                  {summary ? stateLabel(summary.state) : "연결 중..."}
                </span>
                <span style={{ fontSize: "12px", color: "var(--TEXT-SECONDARY)" }}>
                  {new Date(session.expires_at).toLocaleTimeString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  까지
                </span>
              </div>

              {/* 파싱된 인상착의 태그 */}
              {session.parsed_clothing && (
                <div className={styles.clothingRow}>
                  {buildClothingTags(session.parsed_clothing).map((tag) => (
                    <span key={tag} className={styles.clothingTag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className={styles.sessionInfoRow}>
                <span>세션 ID: {session.session_id.slice(0, 8)}...</span>
                {summary && (
                  <span>
                    탐지 {summary.total_matches}명 / 아동 {summary.total_child_matches}명
                  </span>
                )}
              </div>

              {/* 세션 액션 버튼 */}
              <div className={styles.sessionActionRow}>
                {isSessionActive && (
                  <>
                    <button
                      type="button"
                      className={styles.btnSecondary}
                      disabled={isLoading}
                      onClick={handleRequestStaff}
                    >
                      직원 요청
                    </button>
                    <button
                      type="button"
                      className={styles.btnSecondary}
                      disabled={isLoading}
                      onClick={handleFound}
                    >
                      아이 찾았어요
                    </button>
                    <button
                      type="button"
                      className={styles.btnDanger}
                      disabled={isLoading}
                      onClick={handleEndSession}
                    >
                      종료
                    </button>
                  </>
                )}
                {!isSessionActive && (
                  <button
                    type="button"
                    className={styles.btnPrimary}
                    onClick={() => {
                      setSession(null);
                      setSummary(null);
                      setForm(EMPTY_FORM);
                    }}
                  >
                    새 탐지 시작
                  </button>
                )}
              </div>
            </div>

            {/* CCTV 탐지 결과 */}
            {summary && (
              <div className={styles.card}>
                <p className={styles.cardTitle}>
                  CCTV 탐지 결과
                  {summary.total_matches > 0 && ` (${summary.total_matches}명)`}
                </p>

                {summary.cctv_summaries.length === 0 || summary.total_matches === 0 ? (
                  <p className={styles.emptyDetection}>
                    {summary.state === "detecting"
                      ? "CCTV 영상을 분석하는 중입니다..."
                      : "탐지된 후보가 없습니다."}
                  </p>
                ) : (
                  <div className={styles.cctvList}>
                    {summary.cctv_summaries
                      .filter((cctv: CCTVSummary) => cctv.detections.length > 0)
                      .map((cctv: CCTVSummary) => (
                        <div key={cctv.cctv_id} className={styles.cctvItem}>
                          <div className={styles.cctvHeader}>
                            <span className={styles.cctvId}>CCTV {cctv.cctv_id}</span>
                            <span className={styles.cctvMatchBadge}>
                              {cctv.child_matches > 0
                                ? `아동 ${cctv.child_matches}명`
                                : `${cctv.total_matches}명`}
                            </span>
                          </div>
                          <div className={styles.detectionList}>
                            {cctv.detections.map((det: PersonDetection) => (
                              <div key={det.track_id} className={styles.detectionItem}>
                                {det.thumbnail_b64 ? (
                                  <img
                                    src={`data:image/jpeg;base64,${det.thumbnail_b64}`}
                                    alt={`후보 ${det.track_id}`}
                                    className={styles.thumbnail}
                                  />
                                ) : (
                                  <div
                                    className={styles.thumbnailPlaceholder}
                                    aria-hidden="true"
                                  >
                                    ?
                                  </div>
                                )}
                                <div className={styles.detectionInfo}>
                                  <span className={styles.detectionScore}>
                                    일치도 {Math.round(det.clothing_match_score * 100)}%
                                  </span>
                                  {det.is_child && (
                                    <span className={styles.childBadge}>아동 추정</span>
                                  )}
                                </div>
                                {summary.state === "detecting" && (
                                  <button
                                    type="button"
                                    className={styles.lockBtn}
                                    disabled={isLoading}
                                    onClick={() =>
                                      void handleLock(cctv.cctv_id, det.track_id)
                                    }
                                    aria-label={`CCTV ${cctv.cctv_id} 후보 ${det.track_id} 추적 시작`}
                                  >
                                    추적
                                  </button>
                                )}
                                {summary.state === "tracking" &&
                                  summary.locked_cctv_id === cctv.cctv_id &&
                                  summary.locked_track_id === det.track_id && (
                                    <span
                                      style={{
                                        fontSize: "11px",
                                        color: "var(--GREEN)",
                                        fontWeight: "var(--font-semibold)",
                                        flexShrink: 0,
                                      }}
                                    >
                                      추적 중
                                    </span>
                                  )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <div className={styles.bottomSpacer} />
      </div>
    </>
  );
}
