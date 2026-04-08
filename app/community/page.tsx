"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";

import CommunityHero from "@/components/community/CommunityHero";
import MyCommunityBar from "@/components/community/MyCommunityBar";
import CommunityTabs, {
  type TabId,
} from "@/components/community/CommunityTabs";
import CommunityFeed from "@/components/community/CommunityFeed";
import {
  CommunityProjects,
  CommunityEvents,
  CommunityResources,
  CommunityMembers,
} from "@/components/community/CommunityContent";
import { useCommunityMembership } from "@/context/CommunityMembershipContext";

function CommunityPageContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  const {
    isAnyMember,
    loading: membershipLoading,
    selectedSlug,
    selectedCommunity,
  } = useCommunityMembership();

  const [activeTab, setActiveTab] = useState<TabId>("feed");
  const [stats, setStats] = useState({
    members: 0,
    posts: 0,
    countries: 0,
    communities: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joinMessage, setJoinMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const isLoggedIn = !!session;

  useEffect(() => {
    fetch("/api/community/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setStats(d))
      .finally(() => setStatsLoading(false));
  }, []);

  async function handleJoin(slug: string, communityName: string) {
    if (!isLoggedIn) {
      router.push(`/login?callbackUrl=/community`);
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

  // Reset tab when community changes
  useEffect(() => {
    setActiveTab("feed");
  }, [selectedSlug]);

  return (
    <main className="min-h-screen relative">
      {/* Toast */}
      <AnimatePresence>
        {joinMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-24 left-1/2 z-[999] px-6 py-3 rounded-2xl text-sm font-bold shadow-xl backdrop-blur-md"
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
      </AnimatePresence>

      {/* Hero: only for guests or non-members */}
      {!membershipLoading && !isAnyMember && (
        <CommunityHero stats={stats} onJoin={handleJoin} joining={joining} />
      )}

      {/* Member view */}
      {!membershipLoading && isAnyMember && isLoggedIn && (
        <section
          id="community-hub"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8"
        >
          {/* Persistent community switcher */}
          <MyCommunityBar />

          {/* Selected community header */}
          {selectedCommunity && (
            <div className="mb-6">
              <h2
                className="text-xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {selectedCommunity.name}
              </h2>
              <p
                className="text-sm mt-1"
                style={{ color: "var(--text-muted)" }}
              >
                {selectedCommunity.description}
              </p>
            </div>
          )}

          {/* Tabs */}
          <div className="mb-8">
            <CommunityTabs active={activeTab} onChange={setActiveTab} />
          </div>

          {/* Tab content — driven by selectedSlug from context */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedSlug}-${activeTab}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              {activeTab === "feed" && selectedSlug && (
                <CommunityFeed communitySlug={selectedSlug} />
              )}
              {activeTab === "projects" && selectedSlug && (
                <CommunityProjects communitySlug={selectedSlug} />
              )}
              {activeTab === "events" && selectedSlug && (
                <CommunityEvents communitySlug={selectedSlug} />
              )}
              {activeTab === "resources" && selectedSlug && (
                <CommunityResources communitySlug={selectedSlug} />
              )}
              {activeTab === "members" && selectedSlug && (
                <CommunityMembers communitySlug={selectedSlug} />
              )}
            </motion.div>
          </AnimatePresence>
        </section>
      )}
    </main>
  );
}

function CommunityLoading() {
  return (
    <main className="min-h-screen">
      <div className="animate-pulse">
        <div className="h-96 bg-gray-200" />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="h-20 bg-gray-200 rounded mb-6" />
          <div className="h-96 bg-gray-200 rounded" />
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
