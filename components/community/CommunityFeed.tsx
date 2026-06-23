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
  X,
  Loader2,
  Plus,
} from "lucide-react";
import {
  useCommunityFeed,
  usePostComments,
  type CommunityPost,
  type PostComment,
} from "@/hooks/useCommunity";

type InputMode = "text" | "image" | "video" | "document" | "link";

// ── Helpers ──────────────────────────────────────────────────────────────────

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

function Avatar({
  user,
  size = 8,
}: {
  user: { name: string | null; image: string | null };
  size?: number;
}) {
  const px = `${size * 4}px`;
  return user.image ? (
    <img
      src={user.image}
      alt={user.name ?? ""}
      className="rounded-full object-cover flex-shrink-0"
      style={{ width: px, height: px }}
    />
  ) : (
    <div
      className="rounded-full flex items-center justify-center font-bold flex-shrink-0 text-white"
      style={{
        width: px,
        height: px,
        fontSize: size <= 7 ? "10px" : "12px",
        background: "linear-gradient(135deg, var(--purple), var(--scarlet))",
      }}
    >
      {user.name?.[0] ?? "?"}
    </div>
  );
}

// ── Comment thread (SWR + optimistic) ────────────────────────────────────────

function CommentThread({
  postId,
  isLoggedIn,
}: {
  postId: string;
  isLoggedIn: boolean;
}) {
  const { comments, loading, mutate } = usePostComments(postId);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  async function submitComment() {
    if (!text.trim() || sending) return;
    setSending(true);
    const body = text.trim();
    setText("");

    // optimistic comment
    const optimistic: PostComment = {
      id: `temp-${Date.now()}`,
      postId,
      userId: "me",
      content: body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: { id: "me", name: "You", image: null },
    };

    try {
      await mutate(
        async () => {
          const res = await fetch(`/api/posts/${postId}/comment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: body }),
          });
          if (!res.ok) throw new Error();
          const data = await res.json();
          const saved: PostComment = data.comment ?? data;
          // replace optimistic with real, keep others
          return [...comments.filter((c) => c.id !== optimistic.id), saved];
        },
        {
          optimisticData: [...comments, optimistic],
          rollbackOnError: true,
          revalidate: false,
        },
      );
    } catch {
      setText(body); // restore on failure
    } finally {
      setSending(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden w-full"
    >
      <div
        className="mt-2 rounded-2xl p-3 flex flex-col gap-3"
        style={{
          background: "var(--glass-bg-subtle)",
          border: "1px solid var(--glass-border)",
        }}
      >
        {loading ? (
          <div className="flex justify-center py-3">
            <Loader2
              size={16}
              className="animate-spin"
              style={{ color: "var(--text-muted)" }}
            />
          </div>
        ) : comments.length === 0 ? (
          <p
            className="text-xs text-center py-1"
            style={{ color: "var(--text-muted)" }}
          >
            No comments yet.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {comments.map((c) => {
              const firstName = c.user.name
                ? c.user.name.split(" ")[0]
                : "User";
              return (
                <div key={c.id} className="flex items-start gap-2">
                  <Avatar user={c.user} size={6} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[11px] font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {firstName}
                      </span>
                      <span
                        className="text-[10px]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {timeAgo(c.createdAt)}
                      </span>
                    </div>
                    <p
                      className="text-xs leading-relaxed whitespace-pre-wrap break-words"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {c.content}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {isLoggedIn && (
          <div className="flex items-center gap-2">
            <input
              className="flex-1 rounded-xl px-3 py-2 text-xs"
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
                color: "var(--text-primary)",
                outline: "none",
              }}
              placeholder="Write a comment..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submitComment();
                }
              }}
            />
            <button
              onClick={submitComment}
              disabled={!text.trim() || sending}
              aria-label="Send comment"
              className="p-2 rounded-xl flex-shrink-0 transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background:
                  "linear-gradient(135deg, var(--purple), var(--scarlet))",
                color: "#fff",
              }}
            >
              {sending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Post bubble ──────────────────────────────────────────────────────────────

function PostBubble({
  post,
  isOwn,
  isLoggedIn,
  onLike,
  onDelete,
}: {
  post: CommunityPost;
  isOwn: boolean;
  isLoggedIn: boolean;
  onLike: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const liked = post.reactions?.some((r) => r.type === "LIKE") ?? false;
  const [showComments, setShowComments] = useState(false);
  const firstName = post.user.name ? post.user.name.split(" ")[0] : "User";

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
        <span
          className="text-[11px] font-semibold px-1"
          style={{ color: "var(--text-muted)" }}
        >
          {firstName}
        </span>
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
                className="text-sm leading-relaxed whitespace-pre-wrap break-words"
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

        <div
          className={`flex items-center gap-3 px-1 ${isOwn ? "flex-row-reverse" : ""}`}
        >
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            {timeAgo(post.createdAt)}
          </span>
          <button
            onClick={() => onLike(post.id)}
            disabled={!isLoggedIn}
            aria-label={liked ? "Unlike post" : "Like post"}
            className="flex items-center gap-0.5 text-[10px] transition-transform hover:scale-110 disabled:cursor-not-allowed"
            style={{ color: liked ? "var(--scarlet)" : "var(--text-muted)" }}
          >
            <Heart size={10} className={liked ? "fill-current" : ""} />{" "}
            {post._count.reactions}
          </button>
          <button
            onClick={() => setShowComments((v) => !v)}
            aria-label="Toggle comments"
            aria-expanded={showComments}
            className="flex items-center gap-0.5 text-[10px] transition-transform hover:scale-110"
            style={{
              color: showComments ? "var(--purple)" : "var(--text-muted)",
            }}
          >
            <MessageCircle size={10} /> {post._count.comments}
          </button>
          {isOwn && (
            <button
              onClick={() => {
                if (confirm("Delete this message?")) onDelete(post.id);
              }}
              aria-label="Delete post"
              className="ml-1 p-1 text-[10px] rounded-md hover:bg-black/5"
              style={{ color: "var(--scarlet)" }}
            >
              <X size={12} />
            </button>
          )}
        </div>

        <AnimatePresence>
          {showComments && (
            <CommentThread postId={post.id} isLoggedIn={isLoggedIn} />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── Main Feed (SWR-backed) ────────────────────────────────────────────────────

export default function CommunityFeed({
  communitySlug,
}: {
  communitySlug: string;
}) {
  const { data: session } = useSession();
  const messagesRef = useRef<HTMLDivElement>(null);
  const lastPostIdRef = useRef<string | null>(null);

  const { posts, loading, mutate } = useCommunityFeed({ slug: communitySlug });

  const [posting, setPosting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [reactingId, setReactingId] = useState<string | null>(null);

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
      if (dropupRef.current && !dropupRef.current.contains(e.target as Node))
        setDropupOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropupOpen]);

  // auto-scroll only when the newest post actually changes
  useEffect(() => {
    const newestId = posts[0]?.id ?? null;
    if (newestId && newestId !== lastPostIdRef.current) {
      lastPostIdRef.current = newestId;
      const el = messagesRef.current;
      if (el) {
        try {
          el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
        } catch {
          el.scrollTop = el.scrollHeight;
        }
      }
    }
  }, [posts]);

  // ── Like (optimistic via mutate) ──
  async function toggleLike(postId: string) {
    if (!session || reactingId) return;
    setReactingId(postId);
    try {
      await mutate(
        async () => {
          const res = await fetch(`/api/posts/${postId}/react`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "LIKE" }),
          });
          if (!res.ok) throw new Error();
          return undefined; // fall through to revalidate
        },
        {
          optimisticData: posts.map((p) => {
            if (p.id !== postId) return p;
            const liked = p.reactions?.some((r) => r.type === "LIKE");
            return {
              ...p,
              reactions: liked ? [] : [{ type: "LIKE" }],
              _count: {
                ...p._count,
                reactions: p._count.reactions + (liked ? -1 : 1),
              },
            };
          }),
          rollbackOnError: true,
          revalidate: true,
        },
      );
    } catch {
      /* rolled back automatically */
    } finally {
      setReactingId(null);
    }
  }

  // ── Delete (optimistic) ──
  async function handleDelete(postId: string) {
    try {
      await mutate(
        async () => {
          const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
          if (!res.ok) throw new Error();
          return posts.filter((p) => p.id !== postId);
        },
        {
          optimisticData: posts.filter((p) => p.id !== postId),
          rollbackOnError: true,
          revalidate: false,
        },
      );
    } catch {
      /* rolled back */
    }
  }

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

  // ── Submit post (optimistic) ──
  async function handleSend() {
    if (!session) return;
    setError(null);

    const typeMap: Record<InputMode, CommunityPost["type"]> = {
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

    const optimistic: CommunityPost = {
      id: `temp-${Date.now()}`,
      userId: session.user?.id ?? "me",
      communityId: "",
      title: payload.title,
      content: payload.content,
      category: null,
      type: payload.type,
      mediaUrl: payload.mediaUrl ?? null,
      mediaType: payload.mediaType ?? null,
      linkUrl: payload.linkUrl ?? null,
      linkPreview: null,
      tags: payload.tags,
      published: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: {
        id: session.user?.id ?? "me",
        name: session.user?.name ?? "You",
        image: session.user?.image ?? null,
      },
      _count: { comments: 0, reactions: 0 },
      reactions: [],
    };

    setPosting(true);
    try {
      await mutate(
        async () => {
          const res = await fetch(`/api/communities/${communitySlug}/posts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          const saved: CommunityPost = {
            _count: { comments: 0, reactions: 0 },
            reactions: [],
            ...data,
          };
          return [saved, ...posts];
        },
        {
          optimisticData: [optimistic, ...posts],
          rollbackOnError: true,
          revalidate: false,
        },
      );
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

  return (
    <div className="flex flex-col">
      <div
        ref={messagesRef}
        className="overflow-y-auto px-2 py-4 space-y-4"
        style={{
          height: "575px",
          scrollbarWidth: "none",
          paddingBottom: "1rem",
        }}
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
                isLoggedIn={!!session}
                onLike={toggleLike}
                onDelete={handleDelete}
              />
            ))
        )}
        <div />
      </div>

      {session && (
        <div
          className="flex-shrink-0 border-t pt-3"
          style={{ borderColor: "var(--glass-border)" }}
        >
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
                      aria-label="Cancel media post"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <X size={14} />
                    </button>
                  </div>
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

          <div className="flex items-end gap-2">
            <div className="flex items-center gap-1 flex-shrink-0 relative">
              <div className="hidden sm:flex items-center gap-1">
                {(
                  [
                    { m: "image", icon: <ImageIcon size={16} /> },
                    { m: "video", icon: <Video size={16} /> },
                    { m: "document", icon: <FileText size={16} /> },
                    { m: "link", icon: <LinkIcon size={16} /> },
                  ] as { m: InputMode; icon: React.ReactNode }[]
                ).map(({ m, icon }) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    title={m}
                    aria-label={`Add ${m}`}
                    className="p-2 rounded-xl transition-all hover:scale-110"
                    style={{
                      background:
                        mode === m
                          ? "var(--purple-bg, rgba(123,47,190,0.15))"
                          : "var(--glass-bg)",
                      color: mode === m ? "var(--purple)" : "var(--text-muted)",
                      border: "1px solid var(--glass-border)",
                    }}
                  >
                    {icon}
                  </button>
                ))}
                <button
                  title="Audio (coming soon)"
                  aria-label="Audio (coming soon)"
                  disabled
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

              <div className="sm:hidden relative" ref={dropupRef}>
                <button
                  onClick={() => setDropupOpen((v) => !v)}
                  aria-label="Add attachment"
                  aria-expanded={dropupOpen}
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

            <textarea
              className="flex-1 rounded-2xl px-4 py-2.5 text-sm resize-none max-h-[120px] overflow-y-auto"
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
                color: "var(--text-primary)",
                outline: "none",
                height: "44px",
              }}
              placeholder="Write a message..."
              value={text}
              rows={1}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (canSend) handleSend();
                }
              }}
            />

            <button
              title="Audio (coming soon)"
              aria-label="Audio (coming soon)"
              disabled
              className="p-2.5 rounded-2xl flex-shrink-0 opacity-40 cursor-not-allowed sm:hidden"
              style={{
                background: "var(--glass-bg)",
                color: "var(--text-muted)",
                border: "1px solid var(--glass-border)",
              }}
            >
              <Mic size={18} />
            </button>

            <button
              onClick={handleSend}
              disabled={!canSend}
              aria-label="Send message"
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
