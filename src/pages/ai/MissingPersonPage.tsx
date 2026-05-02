import clsx from "clsx";
import { useCallback, useEffect, useRef, useState } from "react";
import { MdChildCare } from "react-icons/md";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Modal from "@/components/common/modals/Modal";
import {
  createMissingPersonSession,
  lockCandidate,
  rejectCandidate,
  getSessionStatus,
  markSessionFound,
  requestStaff,
  endSession,
} from "@/api/ai.api";
import { useMissingPersonStore } from "@/stores/missing-person.store";
import type {
  ClothingQuery,
  PersonDetection,
  CCTVSummary,
} from "@/types/ai";
import { useMissingPersonWs } from "@/hooks/useMissingPersonWs";
import { useMissingPersonScenarioFeed } from "@/hooks/useMissingPersonScenarioFeed";
import type { WsBbox, WsCandidate } from "@/hooks/useMissingPersonWs";
import CandidateDetectionCard from "@/components/missing-person/CandidateDetectionCard";
import CandidateHistoryModal from "@/components/missing-person/CandidateHistoryModal";
import VideoWithBbox from "@/components/missing-person/VideoWithBbox";
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

  // ── WebSocket: 후보 발견 / 추적 상태 ──────────────────────────────
  // auto-pause 흐름은 폐기됐지만 (서버측에서 더 이상 candidate_found 를 push 하지 않음)
  // 구 클라이언트 호환을 위해 핸들러는 유지. UX 는 후보 카드 → 기록 보기 모달로 전환.
  const [pendingCandidate, setPendingCandidate] = useState<WsCandidate | null>(null);
  const [confirmedCandidate, setConfirmedCandidate] = useState<WsCandidate | null>(null);
  const [trackingBbox, setTrackingBbox] = useState<WsBbox | null>(null);
  /** 영상이 일시정지 상태인지 여부 (후보 발견 시 true) */
  const [videoPaused, setVideoPaused] = useState(false);
  /** "기록 보기" 클릭 시 표시할 후보 (시각·위치 타임라인 모달) */
  const [historyDetection, setHistoryDetection] = useState<PersonDetection | null>(null);

  const handleCandidateFound = useCallback((candidate: WsCandidate) => {
    // 동일 trackId 가 매 폴링마다 재전송되므로, 같은 후보면 모달이 깜박이지 않도록 단순 set
    setPendingCandidate((prev) =>
      prev && prev.cctvId === candidate.cctvId && prev.trackId === candidate.trackId
        ? prev
        : candidate,
    );
    setVideoPaused(true);
  }, []);

  const handleTrackingUpdate = useCallback((trackId: number, bbox: WsBbox) => {
    setConfirmedCandidate((prev) => (prev?.trackId === trackId ? prev : prev));
    setTrackingBbox(bbox);
  }, []);

  // Session state (zustand persisted to sessionStorage)
  const session = useMissingPersonStore((s) => s.session);
  const summary = useMissingPersonStore((s) => s.summary);
  const setSession = useMissingPersonStore((s) => s.setSession);
  const setSummary = useMissingPersonStore((s) => s.setSummary);
  const resetSessionStore = useMissingPersonStore((s) => s.reset);

  const isSessionActive =
    session && summary && summary.state !== "found" && summary.state !== "expired";

  // WebSocket 연결 (세션이 활성 상태일 때만)
  useMissingPersonWs({
    enabled: Boolean(isSessionActive),
    sessionId: session?.session_id ?? null,
    onCandidateFound: handleCandidateFound,
    onTrackingUpdate: handleTrackingUpdate,
  });

  // CCTV 실시간 영상 프레임 스트림 (별도 WS: /scenario-feed)
  const { frameUrl } = useMissingPersonScenarioFeed({
    enabled: Boolean(isSessionActive),
    sessionId: session?.session_id ?? null,
    paused: videoPaused,
  });

  // ── Candidate 확인 / 거절 핸들러 ─────────────────────────────────
  const handleConfirmCandidate = useCallback(async () => {
    if (!pendingCandidate || !session) return;
    const candidate = pendingCandidate;
    try {
      await lockCandidate(session.session_id, {
        cctv_id: candidate.cctvId,
        track_id: candidate.trackId,
      });
      setConfirmedCandidate(candidate);
      setPendingCandidate(null);
      setVideoPaused(false);
    } catch (err) {
      console.error(err);
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setErrorModal(detail ?? "추적 시작 중 오류가 발생했습니다.");
    }
  }, [pendingCandidate, session]);

  // 확정 카드는 잠깐만 보이고 자동으로 닫혀, 보호자가 영상 위 bbox 로 객체 위치를 추적할 수 있도록 함.
  useEffect(() => {
    if (!confirmedCandidate) return;
    const t = window.setTimeout(() => {
      setConfirmedCandidate((prev) => (prev === confirmedCandidate ? null : prev));
    }, 2500);
    return () => window.clearTimeout(t);
  }, [confirmedCandidate]);

  const handleRejectCandidate = useCallback(async () => {
    if (!pendingCandidate || !session) return;
    setPendingCandidate(null);
    setVideoPaused(false);
    try {
      await rejectCandidate(session.session_id);
    } catch (err) {
      console.error(err);
      // 거절 실패 시 사용자에게 에러를 강제 표시할 정도의 critical 은 아님
      // 다음 candidate_found 폴링에서 자연스럽게 다시 모달이 뜸
    }
  }, [pendingCandidate, session]);

  const handleCloseConfirmedCard = useCallback(() => {
    setConfirmedCandidate(null);
    setTrackingBbox(null);
  }, []);

  // Polling
  const pollTimerRef = useRef<number | null>(null);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current !== null) {
      window.clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const isNotFound = (err: unknown): boolean =>
    (err as { response?: { status?: number } })?.response?.status === 404;

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
        } catch (err) {
          stopPolling();
          // 서버에서 세션이 사라졌으면 (파드 재기동 등) 로컬 상태 정리
          if (isNotFound(err)) {
            resetSessionStore();
          }
        }
      }, 2000);
    },
    [resetSessionStore, setSummary, stopPolling],
  );

  // 페이지 재진입 시: 만료되지 않은 세션이 보존되어 있으면 폴링 재개
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
        if (data.state !== "found" && data.state !== "expired") {
          startPolling(session.session_id);
        }
      } catch {
        // 서버 측 세션이 사라졌으면 로컬 상태도 정리
        resetSessionStore();
      }
    })();
    return () => {
      stopPolling();
    };
    // session.session_id 가 바뀔 때만 재실행 (마운트 시 1회 + 새 세션 생성 시)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.session_id]);

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

  // 기존 'lock-on 추적' 흐름은 후보 카드 → 기록 보기 모달로 대체됨.
  // lockCandidate / handleLock 핸들러는 더 이상 UI 에서 호출되지 않아 제거.

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
          setInfoModal("미아 찾기가 종료되었습니다");
          const updated = await getSessionStatus(session.session_id);
          setSummary(updated);
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
            // 서버에 이미 세션이 없으면(파드 재기동 등) 정상 종료로 간주
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

  // ── Render ────────────────────────────────────────────────────

  return (
    <>
      <LoadingSpinner isLoading={isLoading} message={loadingMsg} />

      {/* ── 후보 발견 카드 (pending) ── */}
      {pendingCandidate && (
        <CandidateDetectionCard
          photoUrl={pendingCandidate.photoUrl}
          mode="pending"
          onConfirm={handleConfirmCandidate}
          onReject={handleRejectCandidate}
          onClose={handleRejectCandidate}
        />
      )}

      {/* ── 후보 확정 카드 (confirmed) ── */}
      {!pendingCandidate && confirmedCandidate && (
        <CandidateDetectionCard
          photoUrl={confirmedCandidate.photoUrl}
          mode="confirmed"
          onConfirm={handleConfirmCandidate}
          onReject={handleRejectCandidate}
          onClose={handleCloseConfirmedCard}
        />
      )}

      {/* ── 후보 이동 기록 모달 (시각·위치 타임라인) ── */}
      {historyDetection && (
        <CandidateHistoryModal
          detection={historyDetection}
          onClose={() => setHistoryDetection(null)}
        />
      )}

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
            {/* CCTV 영상 플레이어 + bounding box 오버레이 */}
            {isSessionActive && (
              <div className={styles.card}>
                <p className={styles.cardTitle}>CCTV 실시간 영상</p>
                <VideoWithBbox
                  src={frameUrl}
                  bbox={summary?.state === "tracking" ? trackingBbox : null}
                />
              </div>
            )}

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
                      resetSessionStore();
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
                                <button
                                  type="button"
                                  className={styles.lockBtn}
                                  onClick={() => setHistoryDetection(det)}
                                  aria-label={`CCTV ${cctv.cctv_id} 후보 ${det.track_id} 이동 기록 보기`}
                                >
                                  기록 보기
                                </button>
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
