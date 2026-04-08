"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  FileText,
  CheckCircle2,
  Plus,
  ChevronDown,
  LayoutGrid,
} from "lucide-react";
import { useCommunityMembership } from "@/context/CommunityMembershipContext";
import { useCommunities, useJoinCommunity } from "@/hooks/useCommunity";

export default function MyCommunityBar() {
  const [open, setOpen] = useState(false);

  const { memberships, selectedSlug, setSelectedSlug, loading, refresh } =
    useCommunityMembership();

  const { communities: allCommunities, loading: allLoading } = useCommunities();
  const { toggle, loading: joining } = useJoinCommunity();

  const joinedIds = new Set(memberships.map((m) => m.community.id));
  const notJoined = allCommunities.filter((c) => !joinedIds.has(c.id));

  const selected = memberships.find((m) => m.community.slug === selectedSlug);

  // Communities to show in accordion (all except selected)
  const others = memberships.filter((m) => m.community.slug !== selectedSlug);

  async function handleJoin(slug: string) {
    const result = await toggle(slug);
    if (result?.joined) refresh();
  }

  function handleSelect(slug: string) {
    setSelectedSlug(slug);
    setOpen(false);
  }

  if (loading) {
    return (
      <div className="flex gap-3">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="w-64 h-32 rounded-2xl animate-pulse"
            style={{ background: "var(--glass-bg-subtle)" }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {/* ── Top row: Selected card + Toggle card ── */}
      <div className="flex flex-wrap gap-3">
        {/* Selected Community Card */}
        {selected ? (
          <div
            className="w-64 rounded-2xl p-4 relative overflow-hidden flex-shrink-0"
            style={{
              background:
                "linear-gradient(135deg, var(--scarlet), var(--purple))",
              border: "1px solid transparent",
              boxShadow: "0 4px 24px rgba(139,92,246,0.25)",
            }}
          >
            <span className="absolute top-3 right-3">
              <CheckCircle2 size={16} color="#fff" />
            </span>

            <div className="flex items-center gap-3 mb-3">
              {selected.community.image ? (
                <img
                  src={selected.community.image}
                  alt={selected.community.name}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}
                >
                  {selected.community.name[0]}
                </div>
              )}
              <div className="min-w-0">
                <p
                  className="font-bold text-sm truncate"
                  style={{ color: "#fff" }}
                >
                  {selected.community.name}
                </p>
                <p
                  className="text-xs capitalize"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  {selected.role.toLowerCase()}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <span
                className="flex items-center gap-1 text-xs"
                style={{ color: "rgba(255,255,255,0.8)" }}
              >
                <Users size={12} />
                {selected.community.memberCount.toLocaleString()}
              </span>
              <span
                className="flex items-center gap-1 text-xs"
                style={{ color: "rgba(255,255,255,0.8)" }}
              >
                <FileText size={12} />
                {selected.community.postCount.toLocaleString()} posts
              </span>
            </div>
          </div>
        ) : null}

        {/* Accordion Toggle Card */}
        {memberships.length > 1 && (
          <motion.button
            onClick={() => setOpen((v) => !v)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-64 rounded-2xl p-4 text-left flex-shrink-0 transition-all duration-200"
            style={{
              background: "var(--glass-bg)",
              border: open
                ? "1px solid var(--scarlet)"
                : "1px solid var(--glass-border)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, var(--scarlet), var(--purple))",
                }}
              >
                <LayoutGrid size={18} color="#fff" />
              </div>
              <motion.div
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={16} style={{ color: "var(--text-muted)" }} />
              </motion.div>
            </div>

            <p
              className="font-bold text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              {open ? "Hide Communities" : "Switch Community"}
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              {others.length} other{others.length !== 1 ? "s" : ""} joined
            </p>
          </motion.button>
        )}
      </div>

      {/* ── Accordion: Other communities + Join More ── */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="accordion"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="space-y-4 pt-1">
              {/* Other joined communities */}
              {others.length > 0 && (
                <div>
                  <p
                    className="text-xs font-semibold uppercase tracking-widest mb-3"
                    style={{ color: "var(--text-muted)" }}
                  >
                    My Communities
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {others.map(({ community, role }) => (
                      <motion.button
                        key={community.id}
                        onClick={() => handleSelect(community.slug)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-64 rounded-2xl p-4 text-left transition-all duration-200 relative overflow-hidden"
                        style={{
                          background: "var(--glass-bg)",
                          border: "1px solid var(--glass-border)",
                        }}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          {community.image ? (
                            <img
                              src={community.image}
                              alt={community.name}
                              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0"
                              style={{
                                background:
                                  "linear-gradient(135deg, var(--scarlet), var(--purple))",
                                color: "#fff",
                              }}
                            >
                              {community.name[0]}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p
                              className="font-bold text-sm truncate"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {community.name}
                            </p>
                            <p
                              className="text-xs capitalize"
                              style={{ color: "var(--text-muted)" }}
                            >
                              {role.toLowerCase()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <span
                            className="flex items-center gap-1 text-xs"
                            style={{ color: "var(--text-muted)" }}
                          >
                            <Users size={12} />
                            {community.memberCount.toLocaleString()}
                          </span>
                          <span
                            className="flex items-center gap-1 text-xs"
                            style={{ color: "var(--text-muted)" }}
                          >
                            <FileText size={12} />
                            {community.postCount.toLocaleString()} posts
                          </span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Join More */}
              {!allLoading && notJoined.length > 0 && (
                <div>
                  <p
                    className="text-xs font-semibold uppercase tracking-widest mb-3"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Join More Communities
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {notJoined.map((community, i) => (
                      <motion.div
                        key={community.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.06 }}
                        className="w-64 rounded-2xl p-4 relative overflow-hidden"
                        style={{
                          background: "var(--glass-bg)",
                          border: "1px solid var(--glass-border)",
                        }}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          {community.image ? (
                            <img
                              src={community.image}
                              alt={community.name}
                              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0"
                              style={{
                                background:
                                  "linear-gradient(135deg, var(--scarlet), var(--purple))",
                                color: "#fff",
                              }}
                            >
                              {community.name[0]}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p
                              className="font-bold text-sm truncate"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {community.name}
                            </p>
                            <p
                              className="text-xs capitalize"
                              style={{ color: "var(--text-muted)" }}
                            >
                              {community.category}
                            </p>
                          </div>
                        </div>

                        <p
                          className="text-xs leading-relaxed line-clamp-2 mb-4"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {community.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <span
                            className="flex items-center gap-1 text-xs"
                            style={{ color: "var(--text-muted)" }}
                          >
                            <Users size={12} />
                            {community.memberCount.toLocaleString()} members
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleJoin(community.slug)}
                            disabled={joining}
                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl text-white disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{
                              background:
                                "linear-gradient(135deg, var(--scarlet), var(--purple))",
                            }}
                          >
                            <Plus size={12} />
                            Join
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
