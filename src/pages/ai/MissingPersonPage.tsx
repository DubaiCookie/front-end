import clsx from "clsx";
import { useCallback, useEffect, useRef, useState } from "react";
import { MdChildCare } from "react-icons/md";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Modal from "@/components/common/modals/Modal";
import {
  createMissingPersonSession,
  endSession,
  getSessionStatus,
  lockCandidate,
  markSessionFound,
  rejectCandidate,
  requestStaff,
} from "@/api/ai.api";
import { useMissingPersonStore } from "@/stores/missing-person.store";
import type { ClothingQuery, PersonDetection } from "@/types/ai";
import BestCandidateCard from "@/components/missing-person/BestCandidateCard";
import VideoWithBbox from "@/components/missing-person/VideoWithBbox";
import { useMissingPersonScenarioFeed } from "@/hooks/useMissingPersonScenarioFeed";
import {
  useMissingPersonWs,
  type WsCandidate,
} from "@/hooks/useMissingPersonWs";
import { FOUND_LOCATION_TEXT } from "@/types/missing-person-ws";
import styles from "./MissingPersonPage.module.css";

type FormValues = {
  description: string;
};

const EMPTY_FORM: FormValues = {
  description: "",
};

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

function isNotFound(err: unknown): boolean {
  return (err as { response?: { status?: number } })?.response?.status === 404;
}

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

  // 실시간 WS 상태
  const [pendingCandidate, setPendingCandidate] = useState<WsCandidate | null>(null);
  const [trackingUpdatedAt, setTrackingUpdatedAt] = useState<Date | null>(null);
  const [lockedTrackId, setLockedTrackId] = useState<number | null>(null);
  const [actionInFlight, setActionInFlight] = useState(false);

  const session = useMissingPersonStore((s) => s.session);
  const summary = useMissingPersonStore((s) => s.summary);
  const setSession = useMissingPersonStore((s) => s.setSession);
  const setSummary = useMissingPersonStore((s) => s.setSummary);
  const resetSessionStore = useMissingPersonStore((s) => s.reset);

  const sessionState = summary?.state ?? session?.status ?? null;
  const isSessionActive =
    Boolean(session) && sessionState !== "found" && sessionState !== "expired";
  const isTracking = sessionState === "tracking";

  // 후보 카드가 떠 있는 동안 영상 프레임 갱신 일시정지 — 사용자가 인물을 충분히 살피도록
  const scenarioPaused = pendingCandidate !== null && !isTracking;

  // 폴링 (세션 상태/진행도 동기화)
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
          if (data.locked_track_id !== null && data.locked_track_id !== undefined) {
            setLockedTrackId(data.locked_track_id);
          }
          if (data.state === "found" || data.state === "expired") {
            stopPolling();
          }
        } catch (err) {
          stopPolling();
          if (isNotFound(err)) {
            resetSessionStore();
          }
        }
      }, 2000);
    },
    [resetSessionStore, setSummary, stopPolling],
  );

  // 페이지 재진입: 세션 살아있으면 폴링 재개
  useEffect(() => {
    if (!session) {
      return;
    }
    const expired =
      summary?.state === "found" ||
      summary?.state === "expired" ||
      new Date(session.expires_at).getTime() < Date.now();
    if (expired) {
      return;
    }
    void (async () => {
      try {
        const data = await getSessionStatus(session.session_id);
        setSummary(data);
        if (data.locked_track_id !== null && data.locked_track_id !== undefined) {
          setLockedTrackId(data.locked_track_id);
        }
        if (data.state !== "found" && data.state !== "expired") {
          startPolling(session.session_id);
        }
      } catch {
        resetSessionStore();
      }
    })();
    return () => {
      stopPolling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.session_id]);

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  // 세션 바뀌면 실시간 상태 초기화
  useEffect(() => {
    setPendingCandidate(null);
    setTrackingUpdatedAt(null);
    setLockedTrackId(null);
  }, [session?.session_id]);

  // ── 실시간 영상 + WS ─────────────────────────────────────────────
  // 영상은 분석 단계(detecting)에서만 노출 — 추적 단계는 위치 카드로 대체
  // 분석 단계에서 보고 있는 CCTV id (사용자가 버튼으로 전환) — 기본 1구역
  const [activeCctvId, setActiveCctvId] = useState<string>("scenario-cam-02");
  const { frameUrl } = useMissingPersonScenarioFeed({
    enabled: Boolean(session) && isSessionActive && !isTracking,
    sessionId: session?.session_id ?? null,
    cctvId: activeCctvId,
    paused: scenarioPaused,
  });

  const handleCandidateFound = useCallback(
    (cand: WsCandidate) => {
      // 이미 추적 중이면 새 후보 카드를 띄우지 않음
      if (isTracking) {
        return;
      }
      setPendingCandidate(cand);
    },
    [isTracking],
  );

  const handleTrackingUpdate = useCallback(
    (trackId: number) => {
      // 추적 단계 UX 가 영상 박스 → 위치 텍스트로 바뀌어 bbox 자체는 사용 안 함.
      // tracking_update 가 도착했다는 사실만 — 위치 갱신 시각 표시에 사용.
      if (lockedTrackId !== null && trackId !== lockedTrackId) {
        return;
      }
      setTrackingUpdatedAt(new Date());
    },
    [lockedTrackId],
  );

  useMissingPersonWs({
    enabled: Boolean(session) && isSessionActive,
    sessionId: session?.session_id ?? null,
    onCandidateFound: handleCandidateFound,
    onTrackingUpdate: handleTrackingUpdate,
  });

  // ── Form helpers ─────────────────────────────────────────────────
  const updateField = (field: keyof FormValues, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateForm = (): boolean => {
    const errors: Partial<FormValues> = {};
    if (!form.description.trim()) {
      errors.description = "아이의 인상착의를 입력해 주세요.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Session actions ──────────────────────────────────────────────
  const handleStartSession = async () => {
    if (!validateForm()) {
      return;
    }
    try {
      setLoadingMsg("미아 탐지 세션을 시작하는 중입니다...");
      setIsLoading(true);
      const res = await createMissingPersonSession({
        description: form.description,
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

  const handleConfirmCandidate = async () => {
    if (!session || !pendingCandidate) {
      return;
    }
    try {
      setActionInFlight(true);
      await lockCandidate(session.session_id, {
        cctv_id: pendingCandidate.cctvId,
        track_id: pendingCandidate.trackId,
      });
      setLockedTrackId(pendingCandidate.trackId);
      setPendingCandidate(null);
    } catch (err: unknown) {
      console.error(err);
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setErrorModal(detail ?? "추적 시작 중 오류가 발생했습니다.");
    } finally {
      setActionInFlight(false);
    }
  };

  const handleLockFromList = async (cctvId: string, trackId: number) => {
    if (!session) {
      return;
    }
    try {
      setActionInFlight(true);
      await lockCandidate(session.session_id, {
        cctv_id: cctvId,
        track_id: trackId,
      });
      setLockedTrackId(trackId);
    } catch (err: unknown) {
      console.error(err);
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setErrorModal(detail ?? "추적 시작 중 오류가 발생했습니다.");
    } finally {
      setActionInFlight(false);
    }
  };

  const handleRejectCandidate = async () => {
    if (!session || !pendingCandidate) {
      return;
    }
    try {
      setActionInFlight(true);
      await rejectCandidate(session.session_id);
      setPendingCandidate(null);
    } catch (err: unknown) {
      console.error(err);
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setErrorModal(detail ?? "후보 거부 중 오류가 발생했습니다.");
    } finally {
      setActionInFlight(false);
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
          setLoadingMsg("미아 찾기를 종료하는 중입니다...");
          setIsLoading(true);
          await markSessionFound(session.session_id);
          stopPolling();
          const updated = await getSessionStatus(session.session_id);
          setSummary(updated);
          setInfoModal("미아 찾기가 종료되었습니다.");
        } catch (err: unknown) {
          console.error(err);
          setErrorModal("종료 중 오류가 발생했습니다.");
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
          try {
            await endSession(session.session_id);
          } catch (err) {
            if (!isNotFound(err)) {
              throw err;
            }
          }
          stopPolling();
          resetSessionStore();
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

  const handleNewSearch = () => {
    resetSessionStore();
    setForm(EMPTY_FORM);
    setPendingCandidate(null);
    setLockedTrackId(null);
  };

  // ── Render helpers ───────────────────────────────────────────────
  const analysisProgress = summary?.analysis_progress ?? 0;
  const sidebarStage: "form" | "detecting" | "tracking" | "ended" = !session
    ? "form"
    : sessionState === "found" || sessionState === "expired"
      ? "ended"
      : isTracking
        ? "tracking"
        : "detecting";

  const trackingStaleSeconds = trackingUpdatedAt
    ? Math.max(0, Math.round((Date.now() - trackingUpdatedAt.getTime()) / 1000))
    : null;

  // 분석이 끝났는데(>=100%) 후보가 한 명도 없는 상태
  const analysisEmpty =
    sidebarStage === "detecting" &&
    analysisProgress >= 1 &&
    !pendingCandidate;

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

        <div className={styles.layout}>
          {/* ── 상단: 단계 사이드바 ── */}
          <div className={styles.sidebarColumn}>
            {sidebarStage === "form" && (
              <>
                <div className={styles.hintBox}>
                  <p className={styles.hintTitle}>AI 미아 찾기</p>
                  <ul className={styles.hintList}>
                    <li>아이의 인상착의를 입력하면 CCTV 영상에서 실시간 분석합니다.</li>
                    <li>일치하는 인물을 발견하면 사진을 보여드려요.</li>
                    <li>맞다면 영상에서 위치를 박스로 표시해 드립니다.</li>
                  </ul>
                </div>

                <div className={styles.card}>
                  <p className={styles.cardTitle}>아이 인상착의 *</p>
                  <textarea
                    className={styles.textarea}
                    placeholder="예: 흰색 티셔츠, 청바지, 파란 운동화"
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    rows={3}
                  />
                  {formErrors.description && (
                    <span className={styles.fieldError}>{formErrors.description}</span>
                  )}
                  <button
                    type="button"
                    className={styles.btnPrimary}
                    disabled={isLoading}
                    onClick={() => void handleStartSession()}
                  >
                    탐색 시작
                  </button>
                </div>
              </>
            )}

            {sidebarStage === "detecting" && session && (
              <>
                <div className={styles.card}>
                  <p className={styles.cardTitle}>찾고 있어요</p>
                  {session.parsed_clothing && (
                    <div className={styles.clothingRow}>
                      {buildClothingTags(session.parsed_clothing).map((tag) => (
                        <span key={tag} className={styles.clothingTag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className={styles.sidebarSubtle} style={{ marginTop: 10 }}>
                    {pendingCandidate
                      ? "아래 인물이 맞는지 확인해 주세요."
                      : analysisEmpty
                        ? "분석이 완료되었지만 일치하는 인물을 찾지 못했어요. 직원 도움을 요청하시거나 종료해 주세요."
                        : "CCTV 영상에서 일치하는 인물을 찾고 있어요..."}
                  </p>
                </div>

                {pendingCandidate && (
                  <BestCandidateCard
                    detection={{
                      bbox: null,
                      confidence: 0,
                      clothing_match_score: pendingCandidate.clothingMatchScore,
                      is_child: pendingCandidate.isChild,
                      track_id: pendingCandidate.trackId,
                      thumbnail_b64: pendingCandidate.photoUrl
                        ? pendingCandidate.photoUrl.replace(
                            /^data:image\/[^;]+;base64,/,
                            "",
                          )
                        : null,
                    }}
                    onConfirm={() => void handleConfirmCandidate()}
                    onReject={() => void handleRejectCandidate()}
                    disabled={actionInFlight}
                  />
                )}

                {!pendingCandidate &&
                  summary &&
                  summary.cctv_summaries.some((c) => c.detections.length > 0) && (
                    <div className={styles.card}>
                      <p className={styles.cardTitle}>
                        후보 {summary.total_matches}명
                      </p>
                      <div className={styles.detectionList}>
                        {summary.cctv_summaries
                          .flatMap((c) =>
                            c.detections.map((d) => ({ cctv_id: c.cctv_id, det: d })),
                          )
                          .sort(
                            (a, b) =>
                              b.det.clothing_match_score - a.det.clothing_match_score,
                          )
                          .slice(0, 5)
                          .map(({ cctv_id, det }: { cctv_id: string; det: PersonDetection }) => (
                            <div key={`${cctv_id}-${det.track_id}`} className={styles.detectionItem}>
                              {det.thumbnail_b64 ? (
                                <img
                                  src={`data:image/jpeg;base64,${det.thumbnail_b64}`}
                                  alt={`후보 #${det.track_id}`}
                                  className={styles.thumbnail}
                                />
                              ) : (
                                <div className={styles.thumbnailPlaceholder}>?</div>
                              )}
                              <div className={styles.detectionInfo}>
                                <span className={styles.detectionScore}>
                                  유사도 {Math.round(det.clothing_match_score * 100)}%
                                </span>
                                {det.is_child && (
                                  <span className={styles.childBadge}>아이</span>
                                )}
                              </div>
                              <button
                                type="button"
                                className={styles.lockBtn}
                                disabled={actionInFlight}
                                onClick={() => void handleLockFromList(cctv_id, det.track_id)}
                              >
                                이 아이예요
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                <div className={styles.card}>
                  <div className={styles.sessionActionRow}>
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
                      className={styles.btnDanger}
                      disabled={isLoading}
                      onClick={handleEndSession}
                    >
                      종료
                    </button>
                  </div>
                </div>
              </>
            )}

            {sidebarStage === "tracking" && session && (
              <>
                <div className={styles.locationCard}>
                  <span className={styles.locationLabel}>아이의 현재 위치</span>
                  <span className={styles.locationValue}>
                    📍 {FOUND_LOCATION_TEXT}
                  </span>
                  <div className={styles.locationMetaRow}>
                    <span>
                      {trackingStaleSeconds !== null
                        ? `마지막 갱신 ${trackingStaleSeconds}초 전`
                        : "위치 갱신 대기 중..."}
                    </span>
                  </div>
                </div>

                <div className={styles.card}>
                  <p className={styles.cardTitle}>찾고 있던 아이</p>
                  {session.parsed_clothing && (
                    <div className={styles.clothingRow}>
                      {buildClothingTags(session.parsed_clothing).map((tag) => (
                        <span key={tag} className={styles.clothingTag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className={styles.card}>
                  <div className={styles.sessionActionRow}>
                    <button
                      type="button"
                      className={styles.btnPrimary}
                      disabled={isLoading}
                      onClick={handleFound}
                    >
                      아이 찾았어요
                    </button>
                  </div>
                  <div
                    className={styles.sessionActionRow}
                    style={{ marginTop: 8 }}
                  >
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
                      className={styles.btnDanger}
                      disabled={isLoading}
                      onClick={handleEndSession}
                    >
                      종료
                    </button>
                  </div>
                </div>
              </>
            )}

            {sidebarStage === "ended" && (
              <div className={clsx(styles.card, styles.endedCard)}>
                <p className={styles.endedTitle}>
                  {sessionState === "found" ? "✅ 미아 발견 완료" : "세션이 만료되었습니다"}
                </p>
                {sessionState !== "found" && (
                  <p className={styles.endedSub}>필요하시면 새 신고를 시작해 주세요.</p>
                )}
                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={handleNewSearch}
                >
                  새 신고 시작
                </button>
              </div>
            )}
          </div>

          {/* ── 하단: CCTV 영상 (분석 단계에서만 노출, 추적 단계는 위치 카드로 대체) ── */}
          {session && sidebarStage === "detecting" && (
            <div className={styles.videoColumn}>
              <div className={styles.cctvSwitcher}>
                {[
                  { id: "scenario-cam-02", label: "1구역" },
                  { id: "scenario-cam-01", label: "2구역" },
                  { id: "scenario-cam-03", label: "3구역" },
                  { id: "scenario-cam-04", label: "4구역" },
                ].map((cam) => (
                  <button
                    key={cam.id}
                    type="button"
                    className={clsx(
                      styles.cctvSwitchBtn,
                      activeCctvId === cam.id && styles.cctvSwitchBtnActive,
                    )}
                    onClick={() => setActiveCctvId(cam.id)}
                  >
                    {cam.label}
                  </button>
                ))}
              </div>
              <div className={styles.videoFrame}>
                <VideoWithBbox src={frameUrl} bbox={null} />
              </div>
            </div>
          )}
        </div>

        <div className={styles.bottomSpacer} />
      </div>
    </>
  );
}
