"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  MapPin,
  Clock,
  Download,
  Search,
  FileText,
  Video,
  Trash2,
  Pencil,
  ShieldCheck,
  UserMinus,
  Plus,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { SYSTEMS, type SystemId } from "@/data/community";
import { useCommunityMembership } from "@/context/CommunityMembershipContext";
import {
  useCommunityFeed,
  useCommunityMembers,
  useCommunityEvents,
  useCommunityResources,
  type CommunityPost,
  type CommunityMemberRecord,
  type CommunityEvent,
  type CommunityResource,
} from "@/hooks/useCommunity";

// ─── Shared helpers ───────────────────────────────────────────────────────────

function LoadingGrid({ cols = 2 }: { cols?: number }) {
  return (
    <div className={`grid sm:grid-cols-${cols} gap-4`}>
      {Array.from({ length: cols * 2 }).map((_, i) => (
        <div
          key={i}
          className="glass h-40 animate-pulse rounded-2xl"
          style={{ background: "var(--glass-bg-subtle)" }}
        />
      ))}
    </div>
  );
}

function Empty({ message }: { message: string }) {
  return (
    <div className="glass py-16 text-center rounded-2xl">
      <p className="text-sm font-light" style={{ color: "var(--text-muted)" }}>
        {message}
      </p>
    </div>
  );
}

function getSystem(category: string) {
  return SYSTEMS.find((s) => s.id === category) ?? SYSTEMS[0];
}

// ─── Role badge ───────────────────────────────────────────────────────────────

function RoleBadge({
  role,
  isYou = false,
}: {
  role: "MEMBER" | "MODERATOR" | "ADMIN";
  isYou?: boolean;
}) {
  const styles: Record<string, { bg: string; color: string; label: string }> = {
    ADMIN: {
      bg: "linear-gradient(135deg, var(--scarlet), var(--purple))",
      color: "#fff",
      label: "Admin",
    },
    MODERATOR: {
      bg: "linear-gradient(135deg, var(--purple), var(--blue))",
      color: "#fff",
      label: "Mod",
    },
    MEMBER: {
      bg: "var(--badge-neutral-bg)",
      color: "var(--text-secondary)",
      label: "Member",
    },
  };
  const s = styles[role] ?? styles.MEMBER;
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
      style={{ background: s.bg, color: s.color }}
    >
      {role === "ADMIN" && <ShieldCheck size={9} />}
      {s.label}
      {isYou && <span className="opacity-70">· You</span>}
    </span>
  );
}

// ─── useCurrentRole — resolve the acting user's role in the selected community ─

function useCurrentRole(communitySlug: string) {
  const { data: session } = useSession();
  const { memberships } = useCommunityMembership();
  const membership = memberships.find(
    (m) => m.community.slug === communitySlug,
  );
  return {
    currentUserId: session?.user?.id ?? null,
    currentUserRole: membership?.role ?? null,
    isAdmin: membership?.role === "ADMIN",
    isMod: membership?.role === "MODERATOR" || membership?.role === "ADMIN",
  };
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export function CommunityProjects({
  communitySlug = "",
}: {
  selectedSystem?: SystemId | "all"; // kept for compat, ignored
  communitySlug?: string;
}) {
  const { isAdmin } = useCurrentRole(communitySlug);
  const { posts, loading, error, mutate } = useCommunityFeed({
    slug: communitySlug,
  });

  const projects = posts.filter((p) => p.category?.toLowerCase() === "project");

  async function handleDeletePost(postId: string) {
    if (!confirm("Delete this project post?")) return;
    await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    mutate();
  }

  const statusColor: Record<string, string> = {
    Active: "var(--success-text)",
    Recruiting: "var(--warning-text)",
    Completed: "var(--info-text)",
  };
  const statusBg: Record<string, string> = {
    Active: "var(--success-bg)",
    Recruiting: "var(--warning-bg)",
    Completed: "var(--info-bg)",
  };

  return (
    <div>
      {/* Admin: create project button */}
      {isAdmin && (
        <div className="flex justify-end mb-4">
          <button
            className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl text-white"
            style={{
              background:
                "linear-gradient(135deg, var(--scarlet), var(--purple))",
            }}
          >
            <Plus size={13} /> New Project
          </button>
        </div>
      )}

      {loading ? (
        <LoadingGrid cols={2} />
      ) : error ? (
        <Empty message="Failed to load projects." />
      ) : projects.length === 0 ? (
        <Empty message="No projects yet in this community." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {projects.map((proj, i) => {
            const sys = getSystem(proj.category ?? "");
            const statusTag = proj.tags.find((t) => t.startsWith("status:"));
            const status = statusTag
              ? statusTag.replace("status:", "")
              : "Active";

            return (
              <motion.div
                key={proj.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.07 }}
                className="glass flex flex-col gap-4 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: "var(--glass-bg-subtle)",
                        color: "var(--text-muted)",
                      }}
                    >
                      {sys.icon} {sys.label}
                    </span>
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: statusBg[status] ?? statusBg.Active,
                        color: statusColor[status] ?? statusColor.Active,
                      }}
                    >
                      {status}
                    </span>
                  </div>

                  {/* Admin controls */}
                  {isAdmin && (
                    <div className="flex items-center gap-1.5">
                      <button
                        className="p-1.5 rounded-lg transition-all hover:scale-110"
                        style={{
                          background: "var(--glass-bg-subtle)",
                          color: "var(--text-muted)",
                        }}
                        title="Edit post"
                      >
                        <Pencil size={11} />
                      </button>
                      <button
                        onClick={() => handleDeletePost(proj.id)}
                        className="p-1.5 rounded-lg transition-all hover:scale-110"
                        style={{
                          background: "rgba(220,20,60,0.12)",
                          color: "var(--scarlet)",
                        }}
                        title="Delete post"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <h3
                    className="font-extrabold text-sm mb-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {proj.title}
                  </h3>
                  <p
                    className="text-xs font-light leading-relaxed line-clamp-3"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {proj.content}
                  </p>
                </div>

                <div
                  className="flex items-center gap-4 text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  <span className="flex items-center gap-1">
                    <Users size={11} /> {proj._count.reactions} supporters
                  </span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {proj.tags
                    .filter((t) => !t.startsWith("status:"))
                    .map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-1.5 py-0.5 rounded"
                        style={{
                          background: "var(--badge-neutral-bg)",
                          color: "var(--text-muted)",
                        }}
                      >
                        #{t}
                      </span>
                    ))}
                </div>

                <div
                  className="flex items-center justify-between pt-2"
                  style={{ borderTop: "1px solid var(--divider)" }}
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={
                        proj.user.image ??
                        `https://ui-avatars.com/api/?name=${proj.user.name}`
                      }
                      alt={proj.user.name ?? ""}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {proj.user.name}
                    </span>
                  </div>
                  <button
                    className="text-xs font-bold px-3 py-1.5 rounded-lg text-white transition-all hover:scale-105"
                    style={{ background: sys.gradient }}
                  >
                    Join Project
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Events ───────────────────────────────────────────────────────────────────

export function CommunityEvents({
  communitySlug = "",
}: {
  selectedSystem?: SystemId | "all";
  communitySlug?: string;
}) {
  const { isAdmin } = useCurrentRole(communitySlug);
  const { events, loading, error, mutate } = useCommunityEvents(communitySlug);

  async function handleDeleteEvent(eventId: string) {
    if (!confirm("Delete this event?")) return;
    await fetch(`/api/live-sessions/${eventId}`, { method: "DELETE" });
    mutate();
  }

  const statusColor: Record<string, string> = {
    SCHEDULED: "var(--badge-blue-bg)",
    LIVE: "var(--badge-scarlet-bg)",
    ENDED: "var(--glass-bg-subtle)",
    CANCELLED: "var(--glass-bg-subtle)",
  };
  const statusText: Record<string, string> = {
    SCHEDULED: "var(--blue-dark)",
    LIVE: "var(--scarlet-dark)",
    ENDED: "var(--text-muted)",
    CANCELLED: "var(--text-muted)",
  };

  return (
    <div>
      {isAdmin && (
        <div className="flex justify-end mb-4">
          <button
            className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl text-white"
            style={{
              background:
                "linear-gradient(135deg, var(--scarlet), var(--purple))",
            }}
          >
            <Plus size={13} /> Add Event
          </button>
        </div>
      )}

      {loading ? (
        <LoadingGrid cols={1} />
      ) : error ? (
        <Empty message="Failed to load events." />
      ) : events.length === 0 ? (
        <Empty message="No upcoming events in this community." />
      ) : (
        <div className="flex flex-col gap-4">
          {events.map((ev, i) => {
            const sys = getSystem(communitySlug);
            const date = new Date(ev.scheduledAt);

            return (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.07 }}
                className="glass p-5 flex flex-col sm:flex-row gap-5"
              >
                {/* Date block */}
                <div
                  className="flex-shrink-0 w-16 h-16 rounded-2xl flex flex-col items-center justify-center text-white"
                  style={{ background: sys.gradient }}
                >
                  <span className="text-xs font-semibold opacity-80">
                    {date
                      .toLocaleDateString("en-GB", { month: "short" })
                      .toUpperCase()}
                  </span>
                  <span className="text-2xl font-extrabold leading-none">
                    {date.getDate()}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: statusColor[ev.status],
                        color: statusText[ev.status],
                      }}
                    >
                      {ev.status}
                    </span>
                  </div>
                  <h3
                    className="font-extrabold text-sm mb-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {ev.title}
                  </h3>
                  <p
                    className="text-xs font-light mb-3 line-clamp-2"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {ev.description}
                  </p>
                  <div
                    className="flex flex-wrap gap-4 text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <span className="flex items-center gap-1">
                      <Clock size={11} />{" "}
                      {date.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {ev.duration} min
                    </span>
                    {ev.meetingUrl && (
                      <span className="flex items-center gap-1">
                        <MapPin size={11} /> Online
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-shrink-0 flex flex-col justify-center gap-2">
                  <button
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-105"
                    style={{
                      background: sys.gradient,
                      boxShadow: `0 4px 12px ${sys.glow}`,
                    }}
                    onClick={() =>
                      ev.meetingUrl && window.open(ev.meetingUrl, "_blank")
                    }
                  >
                    RSVP
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteEvent(ev.id)}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
                      style={{
                        background: "rgba(220,20,60,0.12)",
                        color: "var(--scarlet)",
                      }}
                    >
                      <Trash2 size={11} /> Delete
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Resources ────────────────────────────────────────────────────────────────

export function CommunityResources({
  communitySlug = "",
}: {
  selectedSystem?: SystemId | "all";
  communitySlug?: string;
}) {
  const { isAdmin } = useCurrentRole(communitySlug);
  const { resources, loading, error } = useCommunityResources(communitySlug);

  function fileIcon(fileType: string) {
    if (fileType.startsWith("video/")) return <Video size={20} />;
    if (fileType.startsWith("image/")) return "🖼️";
    return <FileText size={20} />;
  }

  return (
    <div>
      {isAdmin && (
        <div className="flex justify-end mb-4">
          <button
            className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl text-white"
            style={{
              background:
                "linear-gradient(135deg, var(--scarlet), var(--purple))",
            }}
          >
            <Plus size={13} /> Add Resource
          </button>
        </div>
      )}

      {loading ? (
        <LoadingGrid cols={3} />
      ) : error ? (
        <Empty message="Failed to load resources." />
      ) : resources.length === 0 ? (
        <Empty message="No resources shared in this community yet." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((res, i) => {
            const sys = getSystem(communitySlug);

            return (
              <motion.div
                key={res.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
                className="glass flex flex-col gap-3 p-5"
              >
                <div className="flex items-center justify-between">
                  <span style={{ color: "var(--text-muted)" }}>
                    {fileIcon(res.fileType)}
                  </span>
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: "var(--glass-bg-subtle)",
                      color: "var(--text-muted)",
                    }}
                  >
                    {sys.icon} {sys.label}
                  </span>
                </div>

                <div>
                  <h3
                    className="font-bold text-sm mb-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {res.title}
                  </h3>
                  <p
                    className="text-xs font-light leading-relaxed line-clamp-3"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {res.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1 mt-auto">
                  {res.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{
                        background: "var(--badge-neutral-bg)",
                        color: "var(--text-muted)",
                      }}
                    >
                      #{t}
                    </span>
                  ))}
                </div>

                <div
                  className="flex items-center justify-between pt-3"
                  style={{ borderTop: "1px solid var(--divider)" }}
                >
                  <span
                    className="flex items-center gap-1 text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <Download size={11} /> {res.downloads.toLocaleString()}
                  </span>

                  <div className="flex items-center gap-2">
                    <a
                      href={res.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-white transition-all hover:scale-105"
                      style={{ background: sys.gradient }}
                    >
                      <Download size={11} /> Get
                    </a>

                    {isAdmin && (
                      <button
                        className="p-1.5 rounded-lg transition-all hover:scale-110"
                        style={{
                          background: "rgba(220,20,60,0.12)",
                          color: "var(--scarlet)",
                        }}
                        title="Delete resource"
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Members ──────────────────────────────────────────────────────────────────

export function CommunityMembers({
  communitySlug = "",
}: {
  selectedSystem?: SystemId | "all";
  communitySlug?: string;
}) {
  const [search, setSearch] = useState("");
  const { currentUserId, isAdmin } = useCurrentRole(communitySlug);
  const { members, loading, error, mutate } = useCommunityMembers(
    communitySlug,
    search,
  );

  async function handleRemoveMember(userId: string, userName: string) {
    if (!confirm(`Remove ${userName} from this community?`)) return;
    // POST to leave endpoint on behalf of admin — adjust to your actual route
    await fetch(`/api/communities/${communitySlug}/members/${userId}`, {
      method: "DELETE",
    });
    mutate();
  }

  return (
    <div>
      {/* Search */}
      <div className="relative mb-6">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "var(--text-disabled)" }}
        />
        <input
          type="text"
          placeholder="Search members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
            color: "var(--text-primary)",
            outline: "none",
          }}
        />
      </div>

      {loading ? (
        <LoadingGrid cols={3} />
      ) : error ? (
        <Empty message="Failed to load members." />
      ) : members.length === 0 ? (
        <Empty
          message={
            search
              ? "No members match your search."
              : "No members yet. Be the first to join!"
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member, i) => {
            const sys = getSystem(communitySlug);
            const isYou = member.userId === currentUserId;

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
                className="glass flex flex-col gap-4 p-5 relative"
                style={
                  isYou
                    ? {
                        border: "1px solid var(--purple)",
                        boxShadow: "0 0 0 1px var(--purple)",
                      }
                    : {}
                }
              >
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <img
                      src={
                        member.user.image ??
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          member.user.name ?? "U",
                        )}&background=random`
                      }
                      alt={member.user.name ?? "Member"}
                      className="w-12 h-12 rounded-2xl object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span
                        className="font-bold text-sm truncate"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {member.user.name ?? "Anonymous"}
                      </span>
                      <RoleBadge role={member.role} isYou={isYou} />
                    </div>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {member.user.country ?? "—"} · Joined{" "}
                      {new Date(member.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div
                  className="flex items-center justify-between pt-2"
                  style={{ borderTop: "1px solid var(--divider)" }}
                >
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{
                      background: "var(--glass-bg-subtle)",
                      border: "1px solid var(--glass-border)",
                      color: "var(--text-muted)",
                    }}
                  >
                    {sys.icon} {sys.label}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:scale-105"
                      style={{
                        background: "var(--glass-bg)",
                        border: "1px solid var(--glass-border)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      View Profile
                    </button>

                    {/* Admin can remove anyone except themselves */}
                    {isAdmin && !isYou && (
                      <button
                        onClick={() =>
                          handleRemoveMember(
                            member.userId,
                            member.user.name ?? "this member",
                          )
                        }
                        className="p-1.5 rounded-lg transition-all hover:scale-110"
                        style={{
                          background: "rgba(220,20,60,0.12)",
                          color: "var(--scarlet)",
                        }}
                        title="Remove member"
                      >
                        <UserMinus size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
