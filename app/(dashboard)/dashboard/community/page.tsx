// app/(dashboard)/dashboard/community/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Users,
  FileText,
  Calendar,
  Crown,
  Shield,
  User,
  ArrowRight,
  Plus,
  Globe,
  LogOut,
  Loader2,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface JoinedCommunity {
  membershipId: string;
  joinedAt: string;
  role: "MEMBER" | "MODERATOR" | "ADMIN";
  community: {
    id: string;
    name: string;
    slug: string;
    description: string;
    image: string | null;
    category: string;
    memberCount: number;
    postCount: number;
  };
}

// ── Role badge ────────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: JoinedCommunity["role"] }) {
  const config = {
    ADMIN: {
      label: "Admin",
      icon: Crown,
      color: "var(--scarlet)",
      bg: "rgba(220,20,60,0.12)",
    },
    MODERATOR: {
      label: "Moderator",
      icon: Shield,
      color: "var(--purple)",
      bg: "rgba(139,92,246,0.12)",
    },
    MEMBER: {
      label: "Member",
      icon: User,
      color: "var(--blue)",
      bg: "rgba(59,130,246,0.12)",
    },
  }[role];

  const Icon = config.icon;

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ color: config.color, background: config.bg }}
    >
      <Icon size={10} />
      {config.label}
    </span>
  );
}

// ── Community Card ────────────────────────────────────────────────────────────

function CommunityCard({
  item,
  index,
  onLeave,
  leaving,
}: {
  item: JoinedCommunity;
  index: number;
  onLeave: (slug: string) => void;
  leaving: string | null;
}) {
  const { community, role, joinedAt } = item;

  const joinedDate = new Date(joinedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const isLeaving = leaving === community.slug;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="glass rounded-2xl overflow-hidden flex flex-col relative"
    >
      {/* Banner / Image */}
      <div
        className="h-28 w-full relative flex-shrink-0"
        style={{
          background: community.image
            ? undefined
            : "linear-gradient(135deg, var(--scarlet), var(--purple))",
        }}
      >
        {community.image && (
          <img
            src={community.image}
            alt={community.name}
            className="object-cover"
          />
        )}
        {/* Category pill */}
        <div className="absolute top-3 left-3">
          <span
            className="px-2 py-0.5 rounded-full text-[11px] font-semibold text-white"
            style={{ background: "rgba(0,0,0,0.45)" }}
          >
            {community.category}
          </span>
        </div>
        {/* Role badge */}
        <div className="absolute top-3 right-3">
          <RoleBadge role={role} />
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        <div>
          <h3
            className="font-bold text-base leading-tight mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            {community.name}
          </h3>
          <p
            className="text-xs leading-relaxed line-clamp-2"
            style={{ color: "var(--text-muted)" }}
          >
            {community.description}
          </p>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Users size={12} style={{ color: "var(--text-muted)" }} />
            <span
              className="text-xs font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              {community.memberCount.toLocaleString()} members
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileText size={12} style={{ color: "var(--text-muted)" }} />
            <span
              className="text-xs font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              {community.postCount.toLocaleString()} posts
            </span>
          </div>
        </div>

        {/* Joined date */}
        <div className="flex items-center gap-1.5">
          <Calendar size={11} style={{ color: "var(--text-muted)" }} />
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            Joined {joinedDate}
          </span>
        </div>

        {/* CTAs */}
        <div className="mt-auto pt-2 flex gap-2">
          <Link
            href={`/community/${community.slug}`}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-[1.01] hover:opacity-90"
            style={{
              background:
                "linear-gradient(135deg, var(--scarlet), var(--purple))",
              boxShadow: "0 4px 14px rgba(220,20,60,0.25)",
            }}
          >
            View
            <ArrowRight size={14} />
          </Link>

          {/* ✅ Leave button */}
          <button
            onClick={() => onLeave(community.slug)}
            disabled={isLeaving}
            className="px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
              color: "var(--text-muted)",
            }}
            title="Leave community"
          >
            {isLeaving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <LogOut size={14} />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-12 flex flex-col items-center text-center gap-5 col-span-full"
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, var(--scarlet), var(--purple))",
          boxShadow: "0 8px 24px rgba(220,20,60,0.3)",
        }}
      >
        <Globe size={28} className="text-white" />
      </div>
      <div>
        <h3
          className="text-lg font-bold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          You haven't joined any communities yet
        </h3>
        <p className="text-sm max-w-md" style={{ color: "var(--text-muted)" }}>
          Explore our communities and join the ones that match your interests.
          Connect with like-minded people across Africa.
        </p>
      </div>
      <Link
        href="/community"
        className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-[1.01]"
        style={{
          background: "linear-gradient(135deg, var(--scarlet), var(--purple))",
          boxShadow: "0 4px 14px rgba(220,20,60,0.35)",
        }}
      >
        <Plus size={16} />
        Explore Communities
      </Link>
    </motion.div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="glass rounded-2xl overflow-hidden animate-pulse">
      <div
        className="h-28 w-full"
        style={{ background: "var(--glass-bg-subtle)" }}
      />
      <div className="p-5 flex flex-col gap-3">
        <div
          className="h-4 w-3/4 rounded"
          style={{ background: "var(--glass-bg-subtle)" }}
        />
        <div
          className="h-3 w-full rounded"
          style={{ background: "var(--glass-bg-subtle)" }}
        />
        <div
          className="h-3 w-2/3 rounded"
          style={{ background: "var(--glass-bg-subtle)" }}
        />
        <div
          className="h-9 w-full rounded-xl mt-2"
          style={{ background: "var(--glass-bg-subtle)" }}
        />
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardCommunityPage() {
  const { data: session } = useSession();
  const [communities, setCommunities] = useState<JoinedCommunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leaving, setLeaving] = useState<string | null>(null); // ✅ Track which community is being left

  useEffect(() => {
    fetchMyCommunities();
  }, []);

  async function fetchMyCommunities() {
    try {
      const res = await fetch("/api/communities/my");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setCommunities(data);
    } catch {
      setError("Failed to load your communities. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ✅ Handle leave community
  async function handleLeave(slug: string) {
    if (leaving) return;
    setLeaving(slug);

    try {
      const res = await fetch(`/api/communities/${slug}/join`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to leave community");

      // Remove from local state
      setCommunities((prev) => prev.filter((c) => c.community.slug !== slug));
    } catch (err) {
      setError("Failed to leave community. Please try again.");
    } finally {
      setLeaving(null);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1
            className="text-2xl font-extrabold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            My Communities
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            {loading
              ? "Loading your communities..."
              : communities.length > 0
                ? `You're a member of ${communities.length} communit${communities.length === 1 ? "y" : "ies"}`
                : "You haven't joined any communities yet"}
          </p>
        </div>

        <Link
          href="/community"
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-[1.01]"
          style={{
            background:
              "linear-gradient(135deg, var(--scarlet), var(--purple))",
            boxShadow: "0 4px 14px rgba(220,20,60,0.3)",
          }}
        >
          <Plus size={14} />
          Explore More
        </Link>
      </motion.div>

      {/* Summary stats */}
      {!loading && communities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            {
              label: "Communities Joined",
              value: communities.length,
              icon: Globe,
            },
            {
              label: "Total Members",
              value: communities
                .reduce((acc, c) => acc + c.community.memberCount, 0)
                .toLocaleString(),
              icon: Users,
            },
            {
              label: "Total Posts",
              value: communities
                .reduce((acc, c) => acc + c.community.postCount, 0)
                .toLocaleString(),
              icon: FileText,
            },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="glass rounded-2xl p-4 flex flex-col gap-2"
            >
              <div className="flex items-center gap-2">
                <Icon size={14} style={{ color: "var(--text-muted)" }} />
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  {label}
                </span>
              </div>
              <span
                className="text-2xl font-extrabold"
                style={{ color: "var(--text-primary)" }}
              >
                {value}
              </span>
            </div>
          ))}
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <div
          className="glass rounded-2xl p-4 text-sm font-medium"
          style={{ color: "var(--scarlet)", borderColor: "var(--scarlet)" }}
        >
          {error}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
        ) : communities.length === 0 ? (
          <EmptyState />
        ) : (
          communities.map((item, i) => (
            <CommunityCard
              key={item.membershipId}
              item={item}
              index={i}
              onLeave={handleLeave}
              leaving={leaving}
            />
          ))
        )}
      </div>
    </div>
  );
}
