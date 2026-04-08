"use client";

import { motion } from "framer-motion";
import { Users, FileText, CheckCircle2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCommunityMembership } from "@/context/CommunityMembershipContext";
import { useCommunities, useJoinCommunity } from "@/hooks/useCommunity";

export default function MyCommunityBar() {
  const router = useRouter();
  const { memberships, selectedSlug, setSelectedSlug, loading, refresh } =
    useCommunityMembership();

  const { communities: allCommunities, loading: allLoading } = useCommunities();
  const { toggle, loading: joining } = useJoinCommunity();

  // Communities the user hasn't joined yet
  const joinedIds = new Set(memberships.map((m) => m.community.id));
  const notJoined = allCommunities.filter((c) => !joinedIds.has(c.id));

  async function handleJoin(slug: string) {
    const result = await toggle(slug);
    if (result?.joined) refresh();
  }

  if (loading) {
    return (
      <div className="w-full px-4 py-6">
        <div className="flex gap-4 overflow-x-auto pb-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-64 h-32 rounded-2xl animate-pulse"
              style={{ background: "var(--glass-bg-subtle)" }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-6 space-y-8">
      {/* ── My Communities ── */}
      <div>
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-4"
          style={{ color: "var(--text-muted)" }}
        >
          My Communities
        </p>

        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {memberships.map(({ community, role }) => {
            const isSelected = community.slug === selectedSlug;

            return (
              <motion.button
                key={community.id}
                onClick={() => setSelectedSlug(community.slug)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-shrink-0 w-64 rounded-2xl p-4 text-left transition-all duration-200 relative overflow-hidden"
                style={
                  isSelected
                    ? {
                        background:
                          "linear-gradient(135deg, var(--scarlet), var(--purple))",
                        border: "1px solid transparent",
                        boxShadow: "0 4px 24px rgba(139,92,246,0.25)",
                      }
                    : {
                        background: "var(--glass-bg)",
                        border: "1px solid var(--glass-border)",
                      }
                }
              >
                {isSelected && (
                  <span className="absolute top-3 right-3">
                    <CheckCircle2 size={16} color="#fff" />
                  </span>
                )}

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
                        background: isSelected
                          ? "rgba(255,255,255,0.2)"
                          : "linear-gradient(135deg, var(--scarlet), var(--purple))",
                        color: "#fff",
                      }}
                    >
                      {community.name[0]}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p
                      className="font-bold text-sm truncate"
                      style={{
                        color: isSelected ? "#fff" : "var(--text-primary)",
                      }}
                    >
                      {community.name}
                    </p>
                    <p
                      className="text-xs capitalize"
                      style={{
                        color: isSelected
                          ? "rgba(255,255,255,0.7)"
                          : "var(--text-muted)",
                      }}
                    >
                      {role.toLowerCase()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <span
                    className="flex items-center gap-1 text-xs"
                    style={{
                      color: isSelected
                        ? "rgba(255,255,255,0.8)"
                        : "var(--text-muted)",
                    }}
                  >
                    <Users size={12} />
                    {community.memberCount.toLocaleString()}
                  </span>
                  <span
                    className="flex items-center gap-1 text-xs"
                    style={{
                      color: isSelected
                        ? "rgba(255,255,255,0.8)"
                        : "var(--text-muted)",
                    }}
                  >
                    <FileText size={12} />
                    {community.postCount.toLocaleString()} posts
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Join More ── */}
      {!allLoading && notJoined.length > 0 && (
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: "var(--text-muted)" }}
          >
            Join More Communities
          </p>

          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {notJoined.map((community, i) => (
              <motion.div
                key={community.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                className="flex-shrink-0 w-64 rounded-2xl p-4 relative overflow-hidden"
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
  );
}
