"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Image as ImageIcon,
  Video,
  FileText,
  Link as LinkIcon,
  Mic,
  Heart,
  MessageCircle,
  ThumbsUp,
  X,
  Loader2,
  Plus,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PostData {
  id: string;
  title: string | null;
  content: string | null;
  type: "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT" | "LINK";
  mediaUrl: string | null;
  mediaType: string | null;
  linkUrl: string | null;
  tags: string[];
  user: { id: string; name: string | null; image: string | null };
  _count: { comments: number; reactions: number };
  reactions?: Array<{ type: string }>;
  createdAt: string;
}

type InputMode = "text" | "image" | "video" | "document" | "link";

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function Avatar({ user }: { user: PostData["user"] }) {
  return user.image ? (
    <img
      src={user.image}
      alt={user.name ?? ""}
      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
    />
  ) : (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white"
      style={{
        background: "linear-gradient(135deg, var(--purple), var(--scarlet))",
      }}
    >
      {user.name?.[0] ?? "?"}
    </div>
  );
}

// ── Post bubble ───────────────────────────────────────────────────────────────

function PostBubble({ post, isOwn }: { post: PostData; isOwn: boolean }) {
  const liked = post.reactions?.some((r) => r.type === "LIKE") ?? false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
    >
      {!isOwn && <Avatar user={post.user} />}

      <div
        className={`max-w-[75%] flex flex-col gap-1 ${isOwn ? "items-end" : "items-start"}`}
      >
        {!isOwn && (
          <span
            className="text-[11px] font-semibold px-1"
            style={{ color: "var(--text-muted)" }}
          >
            {post.user.name}
          </span>
        )}

        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: isOwn
              ? "linear-gradient(135deg, var(--purple), var(--scarlet))"
              : "var(--glass-bg)",
            border: isOwn ? "none" : "1px solid var(--glass-border)",
            borderBottomRightRadius: isOwn ? "4px" : "16px",
            borderBottomLeftRadius: isOwn ? "16px" : "4px",
          }}
        >
          {/* Media */}
          {post.type === "IMAGE" && post.mediaUrl && (
            <img
              src={post.mediaUrl}
              alt="post"
              className="max-w-xs w-full object-cover max-h-64 block"
            />
          )}

          {post.type === "VIDEO" && post.mediaUrl && (
            <div className="relative max-w-xs">
              <video
                src={post.mediaUrl}
                controls
                className="w-full max-h-64 block"
              />
            </div>
          )}

          {post.type === "DOCUMENT" && post.mediaUrl && (
            <a
              href={post.mediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 hover:opacity-80 transition-opacity"
              style={{ color: isOwn ? "#fff" : "var(--text-primary)" }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: isOwn
                    ? "rgba(255,255,255,0.2)"
                    : "var(--glass-bg-subtle)",
                }}
              >
                <FileText size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate">
                  {post.title || "Document"}
                </p>
                <p className="text-[10px] opacity-70">Tap to open</p>
              </div>
            </a>
          )}

          {post.type === "LINK" && post.linkUrl && (
            <a
              href={post.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 hover:opacity-80 transition-opacity"
              style={{ color: isOwn ? "#fff" : "var(--text-primary)" }}
            >
              <LinkIcon size={14} className="flex-shrink-0" />
              <span className="text-xs truncate">{post.linkUrl}</span>
            </a>
          )}

          {/* Text content */}
          {post.content && (
            <div className="px-3 py-2.5">
              {post.title && (
                <p
                  className="text-xs font-bold mb-1"
                  style={{ color: isOwn ? "#fff" : "var(--text-primary)" }}
                >
                  {post.title}
                </p>
              )}
              <p
                className="text-sm leading-relaxed whitespace-pre-wrap"
                style={{
                  color: isOwn
                    ? "rgba(255,255,255,0.95)"
                    : "var(--text-primary)",
                }}
              >
                {post.content}
              </p>
            </div>
          )}

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 px-3 pb-2.5">
              {post.tags.map((t) => (
                <span
                  key={t}
                  className="text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{
                    background: isOwn
                      ? "rgba(255,255,255,0.2)"
                      : "var(--glass-bg-subtle)",
                    color: isOwn ? "#fff" : "var(--text-muted)",
                  }}
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Meta */}
        <div
          className={`flex items-center gap-3 px-1 ${isOwn ? "flex-row-reverse" : ""}`}
        >
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            {timeAgo(post.createdAt)}
          </span>
          <span
            className="flex items-center gap-0.5 text-[10px]"
            style={{ color: liked ? "var(--scarlet)" : "var(--text-muted)" }}
          >
            <Heart size={10} className={liked ? "fill-current" : ""} />{" "}
            {post._count.reactions}
          </span>
          <span
            className="flex items-center gap-0.5 text-[10px]"
            style={{ color: "var(--text-muted)" }}
          >
            <MessageCircle size={10} /> {post._count.comments}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Feed ─────────────────────────────────────────────────────────────────

export default function CommunityFeed({
  communitySlug,
}: {
  communitySlug: string;
  selectedSystem?: string;
}) {
  const { data: session } = useSession();
  const bottomRef = useRef<HTMLDivElement>(null);

  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // composer state
  const [mode, setMode] = useState<InputMode>("text");
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [dropupOpen, setDropupOpen] = useState(false);
  const dropupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropupOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (dropupRef.current && !dropupRef.current.contains(e.target as Node)) {
        setDropupOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropupOpen]);

  // ── Fetch posts ─────────────────────────────────────────────────────────────

  async function fetchPosts() {
    try {
      const res = await fetch(`/api/communities/${communitySlug}/posts`);
      if (res.ok) setPosts(await res.json());
    } catch {
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPosts();
  }, [communitySlug]);

  // scroll to bottom when posts load
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [posts.length]);

  // ── Upload media ─────────────────────────────────────────────────────────────

  async function handleMediaUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("files", file);
      fd.append("folder", "community-posts");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMediaUrl(data.uploads.url);
      setMediaType(file.type);
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  // ── Submit post ──────────────────────────────────────────────────────────────

  async function handleSend() {
    if (!session) return;
    setError(null);

    const typeMap: Record<InputMode, string> = {
      text: "TEXT",
      image: "IMAGE",
      video: "VIDEO",
      document: "DOCUMENT",
      link: "LINK",
    };

    const payload: any = {
      type: typeMap[mode],
      content: text.trim() || null,
      title: title.trim() || null,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    if (mode === "image" || mode === "video" || mode === "document") {
      if (!mediaUrl) {
        setError("Please upload a file first.");
        return;
      }
      payload.mediaUrl = mediaUrl;
      payload.mediaType = mediaType;
    }

    if (mode === "link") {
      if (!linkUrl.trim()) {
        setError("Please enter a URL.");
        return;
      }
      payload.linkUrl = linkUrl.trim();
    }

    if (mode === "text" && !text.trim()) {
      setError("Please write something.");
      return;
    }

    setPosting(true);
    try {
      const res = await fetch(`/api/communities/${communitySlug}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // ensure _count exists on optimistic post
      const newPost = {
        _count: { comments: 0, reactions: 0 },
        reactions: [],
        ...data,
      };
      setPosts((prev) => [newPost, ...prev]);
      // reset
      setText("");
      setTitle("");
      setMediaUrl("");
      setMediaType("");
      setLinkUrl("");
      setTags("");
      setMode("text");
    } catch (err: any) {
      setError(err.message || "Failed to post");
    } finally {
      setPosting(false);
    }
  }

  const canSend =
    !posting &&
    !uploading &&
    ((mode === "text" && text.trim()) ||
      (["image", "video", "document"].includes(mode) && mediaUrl) ||
      (mode === "link" && linkUrl.trim()));

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div
      className="flex flex-col"
      style={{ height: "calc(100vh - 180px)", minHeight: "500px" }}
    >
      {/* Messages area */}
      <div
        className="flex-1 overflow-y-auto px-2 py-4 space-y-4"
        style={{ scrollbarWidth: "none" }}
      >
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2
              size={24}
              className="animate-spin"
              style={{ color: "var(--text-muted)" }}
            />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-16">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: "var(--glass-bg-subtle)" }}
            >
              <MessageCircle size={24} style={{ color: "var(--text-muted)" }} />
            </div>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              No posts yet. Say something!
            </p>
          </div>
        ) : (
          [...posts]
            .reverse()
            .map((post) => (
              <PostBubble
                key={post.id}
                post={post}
                isOwn={post.user.id === session?.user?.id}
              />
            ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      {session && (
        <div
          className="flex-shrink-0 border-t pt-3"
          style={{ borderColor: "var(--glass-border)" }}
        >
          {/* Mode-specific input area */}
          <AnimatePresence mode="wait">
            {mode !== "text" && (
              <motion.div
                key={mode}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-2 overflow-hidden"
              >
                <div className="glass rounded-2xl p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs font-semibold capitalize"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {mode} post
                    </span>
                    <button
                      onClick={() => {
                        setMode("text");
                        setMediaUrl("");
                        setMediaType("");
                        setLinkUrl("");
                      }}
                      style={{ color: "var(--text-muted)" }}
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Title field for non-text posts */}
                  <input
                    className="w-full rounded-xl px-3 py-2 text-sm"
                    style={{
                      background: "var(--glass-bg)",
                      border: "1px solid var(--glass-border)",
                      color: "var(--text-primary)",
                      outline: "none",
                    }}
                    placeholder="Title (optional)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />

                  {/* File upload */}
                  {(mode === "image" ||
                    mode === "video" ||
                    mode === "document") && (
                    <label className="cursor-pointer">
                      <div
                        className="w-full rounded-xl flex items-center justify-center gap-2 py-3"
                        style={{
                          border: "2px dashed var(--glass-border)",
                          background: "var(--glass-bg-subtle)",
                        }}
                      >
                        {uploading ? (
                          <Loader2
                            size={18}
                            className="animate-spin"
                            style={{ color: "var(--text-muted)" }}
                          />
                        ) : mediaUrl ? (
                          <div className="flex items-center gap-2">
                            {mode === "image" && (
                              <img
                                src={mediaUrl}
                                alt=""
                                className="h-16 rounded-lg object-cover"
                              />
                            )}
                            {mode === "video" && (
                              <video
                                src={mediaUrl}
                                className="h-16 rounded-lg"
                              />
                            )}
                            {mode === "document" && (
                              <div
                                className="flex items-center gap-2 text-sm"
                                style={{ color: "var(--text-primary)" }}
                              >
                                <FileText size={16} /> File uploaded
                              </div>
                            )}
                          </div>
                        ) : (
                          <span
                            className="text-xs"
                            style={{ color: "var(--text-muted)" }}
                          >
                            Click to upload {mode}
                          </span>
                        )}
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept={
                          mode === "image"
                            ? "image/*"
                            : mode === "video"
                              ? "video/*"
                              : "*/*"
                        }
                        onChange={handleMediaUpload}
                        disabled={uploading}
                      />
                    </label>
                  )}

                  {/* Link URL */}
                  {mode === "link" && (
                    <input
                      className="w-full rounded-xl px-3 py-2 text-sm"
                      style={{
                        background: "var(--glass-bg)",
                        border: "1px solid var(--glass-border)",
                        color: "var(--text-primary)",
                        outline: "none",
                      }}
                      placeholder="https://..."
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                    />
                  )}

                  {/* Tags */}
                  <input
                    className="w-full rounded-xl px-3 py-2 text-sm"
                    style={{
                      background: "var(--glass-bg)",
                      border: "1px solid var(--glass-border)",
                      color: "var(--text-primary)",
                      outline: "none",
                    }}
                    placeholder="Tags (comma separated)"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <p
              className="text-xs font-medium mb-2 px-1"
              style={{ color: "var(--scarlet)" }}
            >
              {error}
            </p>
          )}

          {/* Bottom bar */}
          <div className="flex items-end gap-2">
            {/* Desktop: all type buttons inline | Mobile: + dropup */}
            <div className="flex items-center gap-1 flex-shrink-0 relative">
              {/* Desktop buttons — hidden on mobile */}
              <div className="hidden sm:flex items-center gap-1">
                <button
                  onClick={() => setMode("image")}
                  title="Image"
                  className="p-2 rounded-xl transition-all hover:scale-110"
                  style={{
                    background:
                      mode === "image"
                        ? "var(--purple-bg, rgba(123,47,190,0.15))"
                        : "var(--glass-bg)",
                    color:
                      mode === "image" ? "var(--purple)" : "var(--text-muted)",
                    border: "1px solid var(--glass-border)",
                  }}
                >
                  <ImageIcon size={16} />
                </button>
                <button
                  onClick={() => setMode("video")}
                  title="Video"
                  className="p-2 rounded-xl transition-all hover:scale-110"
                  style={{
                    background:
                      mode === "video"
                        ? "var(--purple-bg, rgba(123,47,190,0.15))"
                        : "var(--glass-bg)",
                    color:
                      mode === "video" ? "var(--purple)" : "var(--text-muted)",
                    border: "1px solid var(--glass-border)",
                  }}
                >
                  <Video size={16} />
                </button>
                <button
                  onClick={() => setMode("document")}
                  title="Document"
                  className="p-2 rounded-xl transition-all hover:scale-110"
                  style={{
                    background:
                      mode === "document"
                        ? "var(--purple-bg, rgba(123,47,190,0.15))"
                        : "var(--glass-bg)",
                    color:
                      mode === "document"
                        ? "var(--purple)"
                        : "var(--text-muted)",
                    border: "1px solid var(--glass-border)",
                  }}
                >
                  <FileText size={16} />
                </button>
                <button
                  onClick={() => setMode("link")}
                  title="Link"
                  className="p-2 rounded-xl transition-all hover:scale-110"
                  style={{
                    background:
                      mode === "link"
                        ? "var(--purple-bg, rgba(123,47,190,0.15))"
                        : "var(--glass-bg)",
                    color:
                      mode === "link" ? "var(--purple)" : "var(--text-muted)",
                    border: "1px solid var(--glass-border)",
                  }}
                >
                  <LinkIcon size={16} />
                </button>
                <button
                  title="Audio (coming soon)"
                  className="p-2 rounded-xl opacity-40 cursor-not-allowed"
                  style={{
                    background: "var(--glass-bg)",
                    color: "var(--text-muted)",
                    border: "1px solid var(--glass-border)",
                  }}
                >
                  <Mic size={16} />
                </button>
              </div>

              {/* Mobile: + dropup button */}
              <div className="sm:hidden relative" ref={dropupRef}>
                <button
                  onClick={() => setDropupOpen((v) => !v)}
                  className="p-2 rounded-xl transition-all hover:scale-110"
                  style={{
                    background: dropupOpen
                      ? "var(--purple-bg, rgba(123,47,190,0.15))"
                      : "var(--glass-bg)",
                    color: dropupOpen ? "var(--purple)" : "var(--text-muted)",
                    border: "1px solid var(--glass-border)",
                  }}
                >
                  <motion.div
                    animate={{ rotate: dropupOpen ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Plus size={18} />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {dropupOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-12 left-0 rounded-2xl p-2 flex flex-col gap-1 z-20"
                      style={{
                        background: "var(--glass-bg)",
                        border: "1px solid var(--glass-border)",
                        backdropFilter: "blur(12px)",
                        minWidth: "140px",
                      }}
                    >
                      {[
                        {
                          m: "image" as InputMode,
                          icon: <ImageIcon size={15} />,
                          label: "Image",
                        },
                        {
                          m: "video" as InputMode,
                          icon: <Video size={15} />,
                          label: "Video",
                        },
                        {
                          m: "document" as InputMode,
                          icon: <FileText size={15} />,
                          label: "Document",
                        },
                        {
                          m: "link" as InputMode,
                          icon: <LinkIcon size={15} />,
                          label: "Link",
                        },
                      ].map(({ m, icon, label }) => (
                        <button
                          key={m}
                          onClick={() => {
                            setMode(m);
                            setDropupOpen(false);
                          }}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-left transition-all hover:scale-[1.02]"
                          style={{
                            background:
                              mode === m
                                ? "var(--purple-bg, rgba(123,47,190,0.15))"
                                : "transparent",
                            color:
                              mode === m
                                ? "var(--purple)"
                                : "var(--text-secondary)",
                          }}
                        >
                          {icon} {label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Text input */}
            <textarea
              className="flex-1 rounded-2xl px-4 py-2.5 text-sm resize-none"
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
                color: "var(--text-primary)",
                outline: "none",
                maxHeight: "120px",
                minHeight: "44px",
              }}
              placeholder="Write a message..."
              value={text}
              rows={1}
              onChange={(e) => {
                setText(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (canSend) handleSend();
                }
              }}
            />

            {/* Audio button — always visible */}
            <button
              title="Audio (coming soon)"
              className="p-2.5 rounded-2xl flex-shrink-0 opacity-40 cursor-not-allowed sm:hidden"
              style={{
                background: "var(--glass-bg)",
                color: "var(--text-muted)",
                border: "1px solid var(--glass-border)",
              }}
            >
              <Mic size={18} />
            </button>

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={!canSend}
              className="p-2.5 rounded-2xl flex-shrink-0 transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background:
                  "linear-gradient(135deg, var(--purple), var(--scarlet))",
                color: "#fff",
              }}
            >
              {posting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Not logged in */}
      {!session && (
        <div
          className="flex-shrink-0 border-t pt-3 text-center text-sm"
          style={{
            borderColor: "var(--glass-border)",
            color: "var(--text-muted)",
          }}
        >
          Sign in to participate in this community.
        </div>
      )}
    </div>
  );
}
