"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ArrowRight } from "lucide-react";
import { useSession } from "next-auth/react";

import CommunityHero from "@/components/community/CommunityHero";
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
import { SYSTEMS, type SystemId } from "@/data/community";

function CommunityPageContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabId>("feed");
  const [selectedSystem, setSelectedSystem] = useState<SystemId | "all">("all");
  const [stats, setStats] = useState({
    members: 0,
    posts: 0,
    countries: 0,
    communities: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const isLoggedIn = !!session;

  // Fetch community stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/community/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch community stats:", error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Handle URL parameters
  useEffect(() => {
    const tabParam = searchParams.get("tab");

    // Check if tab param is a system ID
    if (tabParam && SYSTEMS.some((s) => s.id === tabParam)) {
      setSelectedSystem(tabParam as SystemId);
      setActiveTab("feed"); // Default to feed when selecting a system
    }
  }, [searchParams]);

  return (
    <main className="min-h-screen">
      {/* Full-VH hero — always shown */}
      <CommunityHero
        stats={stats}
        onJoin={() => {
          if (!isLoggedIn) window.location.href = "/register";
          else window.location.href = "/community";
        }}
      />

      {/* Community hub - freely accessible */}
      <section id="community-hub">
        {!isLoggedIn ? null : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Stats */}
            <div className="glass flex flex-wrap items-center justify-around gap-6 p-5 mb-8">
              {statsLoading
                ? // Loading skeleton
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="text-center">
                      <div
                        className="text-2xl font-extrabold bg-gray-300 animate-pulse rounded h-8 w-16 mx-auto mb-1"
                        style={{ background: "var(--glass-bg-subtle)" }}
                      ></div>
                      <div
                        className="text-xs bg-gray-300 animate-pulse rounded h-4 w-20 mx-auto"
                        style={{ background: "var(--glass-bg-subtle)" }}
                      ></div>
                    </div>
                  ))
                : [
                    { value: stats.members, label: "Members" },
                    { value: stats.posts, label: "Posts" },
                    { value: stats.countries, label: "Countries" },
                    { value: stats.communities, label: "Communities" },
                  ].map(({ value, label }) => (
                    <div key={label} className="text-center">
                      <div
                        className="text-2xl font-extrabold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {value.toLocaleString()}+
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {label}
                      </div>
                    </div>
                  ))}
            </div>

            {/*System Filter Pills*/}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedSystem("all")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
                  style={
                    selectedSystem === "all"
                      ? {
                          background:
                            "linear-gradient(135deg, var(--scarlet), var(--purple))",
                          color: "#fff",
                        }
                      : {
                          background: "var(--glass-bg-subtle)",
                          border: "1px solid var(--glass-border)",
                          color: "var(--text-muted)",
                        }
                  }
                >
                  All Systems
                </button>
                {SYSTEMS.map((system) => (
                  <button
                    key={system.id}
                    onClick={() => setSelectedSystem(system.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
                    style={
                      selectedSystem === system.id
                        ? {
                            background: system.gradient,
                            color: "#fff",
                          }
                        : {
                            background: "var(--glass-bg-subtle)",
                            border: "1px solid var(--glass-border)",
                            color: "var(--text-muted)",
                          }
                    }
                  >
                    <span>{system.icon}</span>
                    <span className="hidden sm:inline">{system.label}</span>
                    <span className="sm:hidden">
                      {system.label.split(" ")[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-8">
              <CommunityTabs active={activeTab} onChange={setActiveTab} />
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                {activeTab === "feed" && (
                  <CommunityFeed selectedSystem={selectedSystem} />
                )}
                {activeTab === "projects" && (
                  <CommunityProjects selectedSystem={selectedSystem} />
                )}
                {activeTab === "events" && (
                  <CommunityEvents selectedSystem={selectedSystem} />
                )}
                {activeTab === "resources" && (
                  <CommunityResources selectedSystem={selectedSystem} />
                )}
                {activeTab === "members" && (
                  <CommunityMembers selectedSystem={selectedSystem} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </section>
    </main>
  );
}
// Loading component
function CommunityLoading() {
  return (
    <main className="min-h-screen">
      <div className="animate-pulse">
        <div className="h-96 bg-gray-200"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-20 bg-gray-200 rounded mb-6"></div>
          <div className="flex gap-2 mb-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-8 w-24 bg-gray-200 rounded-full"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    </main>
  );
}

// Main export with Suspense wrapper
export default function CommunityPage() {
  return (
    <Suspense fallback={<CommunityLoading />}>
      <CommunityPageContent />
    </Suspense>
  );
}
