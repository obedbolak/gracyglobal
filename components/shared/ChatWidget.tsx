"use client";
import { useState, useRef, useEffect } from "react";
import {
  Send,
  Loader2,
  MessageCircle,
  X,
  Minus,
  Paperclip,
  Mic,
  Image,
} from "lucide-react";

export default function ChatWidget() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    [],
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
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
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
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
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110"
          style={{
            background:
              "linear-gradient(135deg, var(--purple), var(--scarlet))",
          }}
        >
          <MessageCircle size={24} color="#fff" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-85 max-w-[400px] flex flex-col rounded-2xl overflow-hidden shadow-2xl"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
            backdropFilter: "blur(12px)",
            maxHeight: "calc(100vh - 4rem)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{
              background:
                "linear-gradient(135deg, var(--purple), var(--scarlet))",
            }}
          >
            <div className="flex items-center gap-2">
              <MessageCircle size={18} color="#fff" />
              <span className="text-sm font-bold text-white">
                Gracy Assistant
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-white/20 transition-colors"
              >
                <Minus size={16} color="#fff" />
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  setMessages([]);
                }}
                className="p-1 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X size={16} color="#fff" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto px-3 py-4 space-y-3"
            style={{
              scrollbarWidth: "none",
              minHeight: "280px",
              maxHeight: "340px",
            }}
          >
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-2 py-8">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: "var(--glass-bg-subtle)" }}
                >
                  <MessageCircle
                    size={22}
                    style={{ color: "var(--text-muted)" }}
                  />
                </div>
                <p
                  className="text-xs text-center"
                  style={{ color: "var(--text-muted)" }}
                >
                  Hi! I'm Gracy. Ask me anything 👋
                </p>
              </div>
            )}

            {messages.map((m, i) => {
              const isUser = m.role === "user";
              return (
                <div
                  key={i}
                  className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  {!isUser && (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--purple), var(--scarlet))",
                      }}
                    >
                      G
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    className="max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-relaxed"
                    style={{
                      background: isUser
                        ? "linear-gradient(135deg, var(--purple), var(--scarlet))"
                        : "var(--glass-bg-subtle, rgba(0,0,0,0.05))",
                      color: isUser ? "#fff" : "var(--text-primary)",
                      border: isUser ? "none" : "1px solid var(--glass-border)",
                      borderBottomRightRadius: isUser ? "4px" : "16px",
                      borderBottomLeftRadius: isUser ? "16px" : "4px",
                    }}
                  >
                    {m.content}
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {loading && (
              <div className="flex items-end gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--purple), var(--scarlet))",
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
                  <Loader2
                    size={14}
                    className="animate-spin"
                    style={{ color: "var(--text-muted)" }}
                  />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div
            className="flex items-center gap-1.5 px-3 py-3 flex-shrink-0"
            style={{ borderTop: "1px solid var(--glass-border)" }}
          >
            {/* Paperclip icon for file upload */}
            <button
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
              title="Upload file"
            >
              <Paperclip size={16} color="#fff" />
            </button>

            {/* Image icon */}
            <button
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
              title="Upload image"
            >
              <Image size={16} color="#fff" />
            </button>

            {/* Audio icon */}
            <button
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
              title="Upload audio"
            >
              <Mic size={16} color="#fff" />
            </button>

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask me anything..."
              className="flex-1 min-w-0 rounded-xl px-3 py-2 text-sm outline-none"
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
                color: "var(--text-primary)",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl flex-shrink-0 transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background:
                  "linear-gradient(135deg, var(--purple), var(--scarlet))",
                color: "#fff",
              }}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
