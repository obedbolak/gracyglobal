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

function GateScreen() {
  return (
    <div className="py-20 flex flex-col items-center justify-center px-4 text-center gap-6 relative overflow-hidden">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(123,47,190,0.12) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center gap-6 max-w-lg w-full"
      >
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, var(--purple), var(--blue))",
            boxShadow: "0 8px 32px rgba(123,47,190,0.4)",
          }}
        >
          <Lock size={32} className="text-white" />
        </div>
        <div>
          <h2
            className="text-2xl font-extrabold tracking-tight mb-3"
            style={{ color: "var(--text-primary)" }}
          >
            Sign in to access the Community Hub
          </h2>
          <p
            className="text-sm font-light leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            Discussions, projects, events, resources and members are available
            to all registered members.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {SYSTEMS.map((s) => (
            <span
              key={s.id}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
                color: "var(--text-secondary)",
              }}
            >
              {s.icon} {s.label}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4 w-full">
          {[
            { value: "800+", label: "Members" },
            { value: "50+", label: "Projects" },
            { value: "28", label: "Countries" },
          ].map(({ value, label }) => (
            <div
              key={label}
              className="glass flex flex-col items-center py-4 gap-1"
            >
              <span
                className="text-xl font-extrabold"
                style={{ color: "var(--text-primary)" }}
              >
                {value}
              </span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {label}
              </span>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link
            href="/register"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-white transition-all hover:scale-[1.01]"
            style={{
              background: "linear-gradient(135deg, var(--purple), var(--blue))",
              boxShadow: "0 4px 16px rgba(123,47,190,0.4)",
            }}
          >
            Join Community <ArrowRight size={15} />
          </Link>
          <Link
            href="/login"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-all hover:scale-[1.01]"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
              color: "var(--text-secondary)",
            }}
          >
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

function CommunityPageContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabId>("feed");
  const [selectedSystem, setSelectedSystem] = useState<SystemId | "all">("all");

  const isLoggedIn = !!session;

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
        onJoin={() => {
          if (!isLoggedIn) window.location.href = "/register";
          else window.location.href = "/community";
        }}
      />

      {/* Community hub - freely accessible */}
      <section id="community-hub">
        {!isLoggedIn ? (
          <GateScreen />
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Stats */}
            <div className="glass flex flex-wrap items-center justify-around gap-6 p-5 mb-8">
              {[
                { value: "800+", label: "Members" },
                { value: "50+", label: "Projects" },
                { value: "28", label: "Countries" },
                { value: "7", label: "Systems" },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <div
                    className="text-2xl font-extrabold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {value}
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
