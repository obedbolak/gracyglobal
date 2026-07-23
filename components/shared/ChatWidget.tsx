"use client";
import { useState, useRef, useEffect } from "react";
import {
  Send,
  MessageCircle,
  X,
  Minus,
  Mic,
  Image,
  Plus,
  FileText,
} from "lucide-react";

type Message = { role: string; content: string };

// Shown on the empty state. Tapping one sends it immediately, which gives
// first-time visitors a way in without having to think of a question.
const SUGGESTIONS = [
  "What's on the marketplace right now?",
  "I need to book a service",
  "Show me free courses",
  "How do I reach support?",
];

const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/g;
const urlRegex =
  /(https?:\/\/[^\s<>()]+|\/(?:[a-zA-Z0-9._~:/?#[\]@!$&'()*+,;=%-]+))/g;

function splitTrailingPunctuation(url: string) {
  const match = url.match(/^(.+?)([.,!?;:]+)?$/);
  return {
    href: match?.[1] ?? url,
    trailing: match?.[2] ?? "",
  };
}

function renderLinkedText(text: string) {
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  let key = 0;

  for (const match of text.matchAll(markdownLinkRegex)) {
    const index = match.index ?? 0;
    if (index > cursor) {
      parts.push(...renderBareLinks(text.slice(cursor, index), key));
      key += 1000;
    }
    const href = match[2];
    parts.push(
      <a
        key={`md-${key++}`}
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        className="font-semibold underline underline-offset-2"
        style={{ color: "var(--text-link)", overflowWrap: "anywhere" }}
      >
        {match[1]}
      </a>,
    );
    cursor = index + match[0].length;
  }

  if (cursor < text.length) {
    parts.push(...renderBareLinks(text.slice(cursor), key));
  }
  return parts;
}

function renderBareLinks(text: string, keyOffset = 0) {
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  let key = keyOffset;

  for (const match of text.matchAll(urlRegex)) {
    const index = match.index ?? 0;
    if (index > cursor) parts.push(text.slice(cursor, index));
    const { href, trailing } = splitTrailingPunctuation(match[0]);
    parts.push(
      <a
        key={`url-${key++}`}
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        className="font-semibold underline underline-offset-2"
        style={{ color: "var(--text-link)", overflowWrap: "anywhere" }}
      >
        {href}
      </a>,
    );
    if (trailing) parts.push(trailing);
    cursor = index + match[0].length;
  }

  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
}

export default function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 132)}px`;
  }, [input, open]);

  // On phones the panel covers the whole screen, so the page behind it must
  // stop scrolling - otherwise dragging the message list scrolls the site.
  useEffect(() => {
    if (!open) return;
    if (!window.matchMedia("(max-width: 639px)").matches) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Accepts optional text so the suggestion chips can send without first
  // round-tripping through the input state.
  async function sendMessage(presetText?: string) {
    const text = (presetText ?? input).trim();
    if (!text || loading) return;

    // Snapshot of the thread BEFORE this message - the API appends the new
    // message itself. Without this the assistant has no memory between turns,
    // which is what made it re-greet and re-explain on every reply.
    const priorMessages = messages;
    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setActionsOpen(false);
    setLoading(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: priorMessages }),
      });
      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating toggle button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed right-5 sm:right-6 z-[9999] w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110 active:scale-95"
          style={{
            bottom: "max(1.25rem, calc(env(safe-area-inset-bottom) + 0.5rem))",
            background: "linear-gradient(135deg, var(--purple), var(--scarlet))",
            boxShadow: "var(--btn-primary-shadow)",
          }}
          aria-label="Open Gracy Assistant"
        >
          <MessageCircle size={24} color="#fff" />
        </button>
      )}

      {/* Chat panel — full screen on phones, corner panel from sm up */}
      {open && (
        <div
          className="fixed z-[9999] flex flex-col overflow-hidden shadow-2xl inset-0 rounded-none sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[380px] sm:h-[600px] sm:max-h-[calc(100dvh-3rem)] sm:rounded-2xl"
          style={{
            background: "var(--modal-bg)",
            border: "1px solid var(--modal-border)",
            backdropFilter: "var(--modal-blur)",
            boxShadow: "var(--modal-shadow)",
          }}
          role="dialog"
          aria-label="Gracy Assistant"
        >
          {/* Header — fixed, never grows */}
          <div
            className="flex items-center justify-between gap-2 px-4 py-3 flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, var(--purple), var(--scarlet))",
              paddingTop: "max(0.75rem, env(safe-area-inset-top))",
            }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                <MessageCircle size={17} color="#fff" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold leading-tight text-white">
                  Gracy Assistant
                </p>
                <p className="truncate text-[11px] leading-tight text-white/75">
                  Usually replies instantly
                </p>
              </div>
            </div>
            <div className="flex flex-shrink-0 items-center gap-0.5">
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 transition-colors hover:bg-white/20"
                aria-label="Minimize chat"
              >
                <Minus size={17} color="#fff" />
              </button>
              <button
                onClick={() => { setOpen(false); setMessages([]); }}
                className="rounded-lg p-2 transition-colors hover:bg-white/20"
                aria-label="Close chat and clear conversation"
              >
                <X size={17} color="#fff" />
              </button>
            </div>
          </div>

          {/* Messages — scrollable, fills remaining space */}
          <div
            className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-3 overscroll-contain"
            style={{ scrollbarWidth: "none" }}
          >
            {messages.length === 0 && (
              <div className="flex min-h-full flex-col justify-center px-1 py-6">
                <div
                  className="mb-4 flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold text-white"
                  style={{
                    background: "linear-gradient(135deg, var(--purple), var(--scarlet))",
                  }}
                >
                  G
                </div>
                <h3
                  className="text-lg font-bold leading-snug"
                  style={{ color: "var(--text-primary)" }}
                >
                  Hi there 👋
                </h3>
                <p
                  className="mt-1.5 text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  I&apos;m Gracy. I can help you find a product, book a service,
                  browse courses and jobs, or point you to the right person.
                </p>

                <p
                  className="mb-2 mt-6 text-[11px] font-semibold uppercase tracking-wide"
                  style={{ color: "var(--text-muted)" }}
                >
                  Try asking
                </p>
                <div className="flex flex-col gap-2">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => sendMessage(suggestion)}
                      className="rounded-xl px-3.5 py-2.5 text-left text-sm transition-all hover:opacity-80 active:scale-[0.99]"
                      style={{
                        background: "var(--card-bg)",
                        border: "1px solid var(--glass-border)",
                        color: "var(--text-primary)",
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => {
              const isUser = m.role === "user";
              return (
                <div
                  key={i}
                  className={`flex w-full min-w-0 items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  {!isUser && (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                      style={{
                        background: "linear-gradient(135deg, var(--purple), var(--scarlet))",
                      }}
                    >
                      G
                    </div>
                  )}
                  <div
                    className="min-w-0 max-w-[82%] whitespace-pre-wrap px-3 py-2 text-sm leading-relaxed"
                    style={{
                      background: isUser
                        ? "linear-gradient(135deg, var(--purple), var(--scarlet))"
                        : "var(--card-bg)",
                      color: isUser ? "#fff" : "var(--text-primary)",
                      border: isUser ? "none" : "1px solid var(--glass-border)",
                      borderRadius: "16px",
                      borderBottomRightRadius: isUser ? "4px" : "16px",
                      borderBottomLeftRadius: isUser ? "16px" : "4px",
                      overflowWrap: "anywhere",
                      wordBreak: "break-word",
                    }}
                  >
                    {isUser ? m.content : renderLinkedText(m.content)}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-end gap-2">
                <style>{`
                  @keyframes gracy-typing {
                    0%, 60%, 100% { transform: translateY(0); opacity: 0.35; }
                    30% { transform: translateY(-4px); opacity: 1; }
                  }
                `}</style>
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg, var(--purple), var(--scarlet))",
                  }}
                >
                  G
                </div>
                <div
                  className="flex items-center gap-1 px-3.5 py-3"
                  style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: "16px",
                    borderBottomLeftRadius: "4px",
                  }}
                  role="status"
                  aria-label="Gracy is typing"
                >
                  {[0, 1, 2].map((dot) => (
                    <span
                      key={dot}
                      className="block w-1.5 h-1.5 rounded-full"
                      style={{
                        background: "var(--text-muted)",
                        animation: "gracy-typing 1.2s infinite ease-in-out",
                        animationDelay: `${dot * 0.18}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input bar — fixed, never grows */}
          <div
            className="flex flex-shrink-0 items-end gap-2 px-3 py-3 min-w-0"
            style={{
              borderTop: "1px solid var(--glass-border)",
              background: "var(--card-bg)",
              paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
            }}
          >
            <div className="relative flex-shrink-0">
              {actionsOpen && (
                <div
                  className="absolute bottom-full left-0 mb-2 flex overflow-hidden rounded-xl p-1"
                  style={{
                    background: "var(--modal-bg)",
                    border: "1px solid var(--modal-border)",
                    boxShadow: "var(--modal-shadow)",
                    zIndex: 9999,
                  }}
                >
                  {[
                    { label: "Upload file", icon: FileText },
                    { label: "Upload image", icon: Image },
                    { label: "Upload audio", icon: Mic },
                  ].map(({ label, icon: Icon }) => (
                    <button
                      key={label}
                      type="button"
                      aria-label={label}
                      title={label}
                      className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors"
                      style={{ color: "var(--text-secondary)" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--sidebar-item-hover)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <Icon size={16} style={{ color: "var(--purple)" }} />
                    </button>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => setActionsOpen((v) => !v)}
                className="flex h-11 w-11 items-center justify-center rounded-xl transition-all active:scale-95"
                title="Add attachment"
                aria-label="Add attachment"
                aria-expanded={actionsOpen}
                style={{
                  background: actionsOpen ? "var(--badge-purple-bg)" : "var(--btn-secondary-bg)",
                  border: "1px solid var(--btn-secondary-border)",
                  color: "var(--purple)",
                }}
              >
                <Plus
                  size={18}
                  className={`transition-transform ${actionsOpen ? "rotate-45" : ""}`}
                />
              </button>
            </div>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask me anything..."
              rows={1}
              // text-base (16px) on mobile is deliberate: iOS Safari zooms the
              // whole page when a focused input is under 16px.
              className="min-h-[44px] min-w-0 flex-1 resize-none overflow-y-auto rounded-xl px-3 py-2.5 text-base leading-5 outline-none sm:text-sm"
              style={{
                background: "var(--input-bg)",
                border: "1px solid var(--input-border)",
                color: "var(--text-primary)",
                maxHeight: "88px",
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                background: "linear-gradient(135deg, var(--purple), var(--scarlet))",
                color: "#fff",
                boxShadow: input.trim() ? "var(--btn-primary-shadow)" : "none",
              }}
              aria-label="Send message"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}