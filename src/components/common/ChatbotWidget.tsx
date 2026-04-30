import clsx from "clsx";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IoChatbubbleEllipses, IoClose, IoSend, IoSparkles } from "react-icons/io5";
import Modal from "@/components/common/modals/Modal";
import { askChatbot } from "@/api/chatbot.api";
import type { ChatMessage, RetrievedSource } from "@/types/chatbot";
import styles from "./ChatbotWidget.module.css";

type Bubble = ChatMessage & {
  id: string;
  sources?: RetrievedSource[];
};

const SUGGESTED_QUESTIONS = [
  "오늘 야간 퍼레이드는 몇 시에 시작하나요?",
  "썬더 코스터 키 제한이 어떻게 되나요?",
  "유모차는 어디서 빌릴 수 있어요?",
  "주차 요금이 얼마인가요?",
];

const GREETING: Bubble = {
  id: "greeting",
  role: "assistant",
  content:
    "안녕하세요! WayThing 안내 챗봇이에요. 놀이기구, 퍼레이드, 이벤트, 시설 이용 정보를 물어봐 주세요.",
};

function categoryLabel(category: string): string {
  switch (category) {
    case "rides":
      return "놀이기구";
    case "events":
      return "이벤트";
    case "parades":
      return "퍼레이드";
    case "facility":
      return "시설";
    default:
      return category || "기타";
  }
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [bubbles, setBubbles] = useState<Bubble[]>([GREETING]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [bubbles, isSending, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const apiHistory = useMemo<ChatMessage[]>(
    () =>
      bubbles
        .filter((b) => b.id !== "greeting")
        .map(({ role, content }) => ({ role, content })),
    [bubbles],
  );

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isSending) {
        return;
      }

      const userBubble: Bubble = {
        id: `u-${Date.now()}`,
        role: "user",
        content: trimmed,
      };
      const nextHistory: ChatMessage[] = [
        ...apiHistory,
        { role: "user", content: trimmed },
      ];

      setBubbles((prev) => [...prev, userBubble]);
      setInput("");
      setIsSending(true);

      try {
        const res = await askChatbot({
          messages: nextHistory,
          conversation_id: conversationId,
        });
        setConversationId(res.conversation_id);
        setBubbles((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            content: res.answer || "(응답이 비어 있습니다)",
            sources: res.sources,
          },
        ]);
      } catch (err: unknown) {
        console.error(err);
        const detail =
          (err as { response?: { data?: { detail?: string } } })?.response?.data
            ?.detail;
        setErrorModal(detail ?? "챗봇 응답 중 오류가 발생했습니다.");
      } finally {
        setIsSending(false);
      }
    },
    [apiHistory, conversationId, isSending],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void send(input);
    }
  };

  const handleReset = () => {
    setBubbles([GREETING]);
    setConversationId(null);
    setInput("");
  };

  return (
    <>
      <Modal
        isOpen={errorModal !== null}
        title="오류"
        content={errorModal ?? ""}
        buttonTitle="확인"
        onClose={() => setErrorModal(null)}
        onButtonClick={() => setErrorModal(null)}
      />

      {!isOpen && (
        <button
          type="button"
          className={styles.fab}
          aria-label="챗봇 열기"
          onClick={() => setIsOpen(true)}
        >
          <IoChatbubbleEllipses className={styles.fabIcon} />
        </button>
      )}

      {isOpen && (
        <div
          className={styles.panel}
          role="dialog"
          aria-label="WayThing 안내 챗봇"
        >
          <div className={styles.panelHeader}>
            <div className={styles.headerTitle}>
              <IoSparkles className={styles.headerIcon} />
              <span>WayThing 챗봇</span>
            </div>
            <div className={styles.headerActions}>
              <button
                type="button"
                className={styles.resetBtn}
                onClick={handleReset}
                disabled={isSending || bubbles.length <= 1}
              >
                새 대화
              </button>
              <button
                type="button"
                className={styles.closeBtn}
                aria-label="챗봇 닫기"
                onClick={() => setIsOpen(false)}
              >
                <IoClose />
              </button>
            </div>
          </div>

          <div className={styles.messageList} ref={listRef}>
            {bubbles.map((b) => (
              <div
                key={b.id}
                className={clsx(
                  styles.bubbleRow,
                  b.role === "user" ? styles.bubbleRowUser : styles.bubbleRowBot,
                )}
              >
                <div
                  className={clsx(
                    styles.bubble,
                    b.role === "user" ? styles.bubbleUser : styles.bubbleBot,
                  )}
                >
                  <p className={styles.bubbleText}>{b.content}</p>
                  {b.sources && b.sources.length > 0 && (
                    <div className={styles.sourceList}>
                      {b.sources.map((s) => (
                        <span key={s.id} className={styles.sourceChip}>
                          <span className={styles.sourceCategory}>
                            {categoryLabel(s.category)}
                          </span>
                          <span className={styles.sourceTitle}>{s.title}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isSending && (
              <div className={clsx(styles.bubbleRow, styles.bubbleRowBot)}>
                <div className={clsx(styles.bubble, styles.bubbleBot)}>
                  <span className={styles.typingDots}>
                    <span />
                    <span />
                    <span />
                  </span>
                </div>
              </div>
            )}
          </div>

          {bubbles.length <= 1 && (
            <div className={styles.suggestRow}>
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  className={styles.suggestBtn}
                  disabled={isSending}
                  onClick={() => void send(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <form className={styles.inputBar} onSubmit={handleSubmit}>
            <textarea
              className={styles.input}
              placeholder="궁금한 점을 입력해 주세요"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={isSending}
            />
            <button
              type="submit"
              className={styles.sendBtn}
              disabled={isSending || !input.trim()}
              aria-label="전송"
            >
              <IoSend />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
