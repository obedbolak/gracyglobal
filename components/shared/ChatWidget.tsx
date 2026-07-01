"use client";
import { useState, useRef, useEffect } from "react";
import {
  Send,
  Loader2,
  MessageCircle,
  X,
  Minus,
  Mic,
  Image,
  Plus,
  FileText,
} from "lucide-react";

type Message = { role: string; content: string };

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

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setActionsOpen(false);
    setLoading(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
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
          className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110"
          style={{
            background: "linear-gradient(135deg, var(--purple), var(--scarlet))",
            boxShadow: "var(--btn-primary-shadow)",
          }}
          aria-label="Open Gracy Assistant"
        >
          <MessageCircle size={24} color="#fff" />
        </button>
      )}

      {/* Chat panel — fixed 360×580, compact corner widget */}
      {open && (
        <div
          className="fixed bottom-6 right-6 z-[9999] flex flex-col overflow-hidden rounded-2xl shadow-2xl"
          style={{
            width: "360px",
            height: "580px",
            background: "var(--modal-bg)",
            border: "1px solid var(--modal-border)",
            backdropFilter: "var(--modal-blur)",
            boxShadow: "var(--modal-shadow)",
          }}
        >
          {/* Header — fixed, never grows */}
          <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, var(--purple), var(--scarlet))",
            }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <MessageCircle size={18} color="#fff" className="flex-shrink-0" />
              <span className="text-sm font-bold text-white truncate">
                Gracy Assistant
              </span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-white/20 transition-colors"
                aria-label="Minimize chat"
              >
                <Minus size={16} color="#fff" />
              </button>
              <button
                onClick={() => { setOpen(false); setMessages([]); }}
                className="p-1 rounded-lg hover:bg-white/20 transition-colors"
                aria-label="Close chat"
              >
                <X size={16} color="#fff" />
              </button>
            </div>
          </div>

          {/* Messages — scrollable, fills remaining space */}
          <div
            className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-3 overscroll-contain"
            style={{ scrollbarWidth: "none" }}
          >
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-2 py-8">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: "var(--glass-bg-subtle)" }}
                >
                  <MessageCircle size={22} style={{ color: "var(--text-muted)" }} />
                </div>
                <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
                  Hi! I&apos;m Gracy. Ask me anything 👋
                </p>
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
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg, var(--purple), var(--scarlet))",
                  }}
                >
                  G
                </div>
                <div
                  className="px-4 py-2.5 rounded-2xl"
                  style={{
                    background: "var(--glass-bg-subtle, rgba(0,0,0,0.05))",
                    border: "1px solid var(--glass-border)",
                    borderBottomLeftRadius: "4px",
                  }}
                >
                  <Loader2 size={14} className="animate-spin" style={{ color: "var(--text-muted)" }} />
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
              className="min-h-[44px] min-w-0 flex-1 resize-none overflow-y-auto rounded-xl px-3 py-2.5 text-sm leading-5 outline-none"
              style={{
                background: "var(--input-bg)",
                border: "1px solid var(--input-border)",
                color: "var(--text-primary)",
                maxHeight: "88px",
              }}
            />
            <button
              onClick={sendMessage}
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