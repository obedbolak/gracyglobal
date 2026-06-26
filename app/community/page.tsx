// app/community/page.tsx - Browse & Discover Communities

"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { Loader2, Check, X, Search, ArrowRight } from "lucide-react";
import { useCommunityMembership } from "@/context/CommunityMembershipContext";

const CATEGORIES = [
  "Health & Environment",
  "Education & Knowledge",
  "Governance & Law",
  "Economic Empowerment",
  "Youth Empowerment",
  "Women Empowerment",
  "Other",
];

const FALLBACK_CARD_IMAGE =
  "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=80";

interface CommunitySummary {
  slug: string;
  name: string;
  description: string;
  memberCount?: number;
  postCount?: number;
  image?: string;
}

function CommunityPageContent() {
  const { data: session } = useSession();
  const router = useRouter();

  const { isMember, refresh } = useCommunityMembership();

  const [communities, setCommunities] = useState<CommunitySummary[]>([]);
  const [communitiesLoading, setCommunitiesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [joining, setJoining] = useState(false);
  const [joinMessage, setJoinMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const isLoggedIn = !!session;

  useEffect(() => {
    fetch("/api/communities")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) =>
        setCommunities(Array.isArray(d) ? d : (d?.communities ?? [])),
      )
      .catch(() => setCommunities([]))
      .finally(() => setCommunitiesLoading(false));
  }, []);

  const filteredCommunities = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return communities;
    return communities.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q),
    );
  }, [communities, searchQuery]);

  function openCommunity(slug: string) {
    router.push(`/community/${slug}`);
  }

  async function handleJoin(slug: string, communityName: string) {
    if (!isLoggedIn) {
      const dest = encodeURIComponent(`/community/${slug}`);
      router.push(`/login?callbackUrl=${dest}`);
      return;
    }
    if (joining) return;
    setJoining(true);
    setJoinMessage(null);
    try {
      const res = await fetch(`/api/communities/${slug}/join`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to join");
      setJoinMessage({
        type: data.joined ? "success" : "info",
        text: data.joined
          ? `✅ You've joined ${communityName}!`
          : `You're already a member of ${communityName}.`,
      });
      refresh();
      openCommunity(slug);
    } catch (err: any) {
      setJoinMessage({
        type: "error",
        text: err.message || "Something went wrong.",
      });
    } finally {
      setJoining(false);
      setTimeout(() => setJoinMessage(null), 4000);
    }
  }

  return (
    <main className="min-h-screen relative mb-16">
      {/* Toast */}
      {joinMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -20, x: "-50%" }}
          className="fixed top-24 left-1/2 z-[999] px-6 py-3 rounded-2xl text-sm font-bold shadow-xl backdrop-blur-md max-w-[90vw] text-center"
          style={{
            background:
              joinMessage.type === "success"
                ? "rgba(22,163,74,0.9)"
                : joinMessage.type === "error"
                  ? "rgba(220,20,60,0.9)"
                  : "rgba(139,92,246,0.9)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          {joinMessage.text}
        </motion.div>
      )}

      {/* Search — for members and guests alike */}
      <section className="max-w-7xl mx-auto px-4 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl">
          <CommunitySearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
      </section>

      {/* Browse all communities */}
      <CommunityBrowser
        communities={filteredCommunities}
        communitiesLoading={communitiesLoading}
        isMember={isMember}
        onJoin={handleJoin}
        onOpen={openCommunity}
        joining={joining}
        isLoggedIn={isLoggedIn}
        hasQuery={searchQuery.trim().length > 0}
      />
    </main>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/* Search bar component                                                */
/* ─────────────────────────────────────────────────────────────────── */

function CommunitySearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2"
        style={{ color: "var(--text-muted)" }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search communities by name or topic"
        className="w-full rounded-xl border py-3 pl-11 pr-10 text-sm outline-none transition-colors"
        style={{
          borderColor: "var(--input-border)",
          color: "var(--text-primary)",
          background: "var(--input-bg)",
        }}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 transition-colors hover:bg-black/5"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
        </button>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/* Browse grid — display all communities                               */
/* ─────────────────────────────────────────────────────────────────── */

function CommunityBrowser({
  communities,
  communitiesLoading,
  isMember,
  onJoin,
  onOpen,
  joining,
  isLoggedIn,
  hasQuery,
}: {
  communities: CommunitySummary[];
  communitiesLoading: boolean;
  isMember: (slug: string) => boolean;
  onJoin: (slug: string, name: string) => void;
  onOpen: (slug: string) => void;
  joining: boolean;
  isLoggedIn: boolean;
  hasQuery: boolean;
}) {
  return (
    <section className="max-w-7xl mx-auto px-4 pb-12 pt-6 sm:px-6 lg:px-8">
      {communitiesLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[4/3] animate-pulse rounded-2xl"
              style={{ background: "var(--skeleton-base)" }}
            />
          ))}
        </div>
      ) : communities.length === 0 ? (
        <div
          className="rounded-2xl border px-6 py-16 text-center text-sm"
          style={{
            borderColor: "var(--card-border)",
            color: "var(--text-muted)",
          }}
        >
          {hasQuery
            ? "No communities match your search."
            : "No communities are open right now. Check back soon."}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {communities.map((community, i) => (
            <CommunityCard
              key={community.slug}
              community={community}
              index={i}
              isMember={isMember(community.slug)}
              onJoin={onJoin}
              onOpen={onOpen}
              joining={joining}
              isLoggedIn={isLoggedIn}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function CommunityCard({
  community,
  index,
  isMember,
  onJoin,
  onOpen,
  joining,
  isLoggedIn,
}: {
  community: CommunitySummary;
  index: number;
  isMember: boolean;
  onJoin: (slug: string, name: string) => void;
  onOpen: (slug: string) => void;
  joining: boolean;
  isLoggedIn: boolean;
}) {
  const backgroundImage = community.image || FALLBACK_CARD_IMAGE;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index, 7) * 0.05 }}
      role={isMember ? "button" : undefined}
      tabIndex={isMember ? 0 : undefined}
      onClick={isMember ? () => onOpen(community.slug) : undefined}
      onKeyDown={
        isMember
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onOpen(community.slug);
            }
          : undefined
      }
      className={`group relative aspect-[4/3] overflow-hidden rounded-2xl outline-none ${
        isMember ? "cursor-pointer" : ""
      }`}
    >
      {/* Static background image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-105"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      {/* Gradient so text stays legible over any photo */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/5" />

      <div className="absolute left-3 top-3 flex gap-2">
        {isMember && (
          <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-neutral-900">
            <Check className="h-3 w-3" />
            Member
          </span>
        )}
      </div>

      {typeof community.memberCount === "number" && (
        <span className="absolute right-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
          {community.memberCount.toLocaleString()} members
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <h3 className="text-base font-bold leading-snug text-white sm:text-lg">
          {community.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/80 sm:text-sm">
          {community.description}
        </p>

        {isMember ? (
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-white">
            Open community
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onJoin(community.slug, community.name);
            }}
            disabled={joining}
            className="mt-3 w-full rounded-xl bg-white/95 py-2 text-sm font-semibold text-neutral-900 backdrop-blur transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {joining
              ? "Joining…"
              : isLoggedIn
                ? "Join community"
                : "Sign in to join"}
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* ----------------------------------------------------------------- */

function CommunityLoading() {
  return (
    <main className="min-h-screen">
      <div className="animate-pulse">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-6 h-12 max-w-xl rounded-xl bg-gray-200" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] rounded-2xl bg-gray-200" />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CommunityPage() {
  return (
    <Suspense fallback={<CommunityLoading />}>
      <CommunityPageContent />
    </Suspense>
  );
}
