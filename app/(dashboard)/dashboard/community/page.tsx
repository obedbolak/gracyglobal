// app/(dashboard)/dashboard/community/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
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
  X,
  ImageIcon,
  ChevronLeft,
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

const CATEGORIES = [
  "Health & Environment",
  "Education & Knowledge",
  "Governance & Law",
  "Economic Empowerment",
  "Youth Empowerment",
  "Women Empowerment",
  "Other",
];

// ── Role badge ────────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: JoinedCommunity["role"] }) {
  const config = {
    ADMIN: { label: "Admin", icon: Crown, color: "var(--scarlet)", bg: "rgba(220,20,60,0.12)" },
    MODERATOR: { label: "Moderator", icon: Shield, color: "var(--purple)", bg: "rgba(139,92,246,0.12)" },
    MEMBER: { label: "Member", icon: User, color: "var(--blue)", bg: "rgba(59,130,246,0.12)" },
  }[role];
  const Icon = config.icon;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{ color: config.color, background: config.bg }}>
      <Icon size={10} />
      {config.label}
    </span>
  );
}

// ── Confirm Leave Dialog ──────────────────────────────────────────────────────

function LeaveConfirmDialog({ communityName, onConfirm, onCancel, loading }: {
  communityName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.5)" }} onClick={onCancel} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative glass rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4"
        style={{ zIndex: 1 }}
      >
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto" style={{ background: "rgba(220,20,60,0.12)" }}>
          <LogOut size={20} style={{ color: "var(--scarlet)" }} />
        </div>
        <div className="text-center">
          <h3 className="font-bold text-base mb-1" style={{ color: "var(--text-primary)" }}>Leave {communityName}?</h3>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            You'll lose access to this community's posts and discussions. You can rejoin at any time.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading} className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.01] disabled:opacity-50" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--text-muted)" }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.01] disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: "var(--scarlet)" }}>
            {loading ? <Loader2 size={14} className="animate-spin" /> : <><LogOut size={14} />Leave</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Community Card ────────────────────────────────────────────────────────────

function CommunityCard({ item, index, onLeave, leaving }: {
  item: JoinedCommunity;
  index: number;
  onLeave: (slug: string) => void;
  leaving: string | null;
}) {
  const { community, role, joinedAt } = item;
  const joinedDate = new Date(joinedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const isLeaving = leaving === community.slug;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} className="glass rounded-2xl overflow-hidden flex flex-col">
      <div className="h-28 w-full relative flex-shrink-0" style={{ background: community.image ? undefined : "linear-gradient(135deg, var(--scarlet), var(--purple))" }}>
        {community.image && <Image src={community.image} alt={community.name} fill className="object-cover" />}
        <div className="absolute top-3 left-3" style={{ zIndex: 1 }}>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold text-white" style={{ background: "rgba(0,0,0,0.45)" }}>{community.category}</span>
        </div>
        <div className="absolute top-3 right-3" style={{ zIndex: 1 }}>
          <RoleBadge role={role} />
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1 gap-3">
        <div>
          <h3 className="font-bold text-base leading-tight mb-1" style={{ color: "var(--text-primary)" }}>{community.name}</h3>
          <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "var(--text-muted)" }}>{community.description}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Users size={12} style={{ color: "var(--text-muted)" }} />
            <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{community.memberCount.toLocaleString()} members</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileText size={12} style={{ color: "var(--text-muted)" }} />
            <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{community.postCount.toLocaleString()} posts</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar size={11} style={{ color: "var(--text-muted)" }} />
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>Joined {joinedDate}</span>
        </div>
        <div className="mt-auto pt-2 flex gap-2">
          <Link href={`/community?slug=${community.slug}`} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.01]" style={{ background: "linear-gradient(135deg, var(--scarlet), var(--purple))", boxShadow: "0 4px 14px rgba(220,20,60,0.25)" }}>
            View <ArrowRight size={14} />
          </Link>
          <button onClick={() => onLeave(community.slug)} disabled={isLeaving || !!leaving} className="px-3 py-2.5 rounded-xl transition-all hover:scale-[1.01] disabled:opacity-50 flex items-center justify-center" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--text-muted)", minWidth: "40px" }} title="Leave community">
            {isLeaving ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-12 flex flex-col items-center text-center gap-5 col-span-full">
      <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--scarlet), var(--purple))", boxShadow: "0 8px 24px rgba(220,20,60,0.3)" }}>
        <Globe size={28} className="text-white" />
      </div>
      <div>
        <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>You haven't joined any communities yet</h3>
        <p className="text-sm max-w-md" style={{ color: "var(--text-muted)" }}>Explore existing communities or create your own and start building together.</p>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/community" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.01]" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--text-secondary)" }}>
          <Globe size={14} /> Explore
        </Link>
        <button onClick={onCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.01]" style={{ background: "linear-gradient(135deg, var(--scarlet), var(--purple))", boxShadow: "0 4px 14px rgba(220,20,60,0.35)" }}>
          <Plus size={14} /> Create Community
        </button>
      </div>
    </motion.div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="glass rounded-2xl overflow-hidden animate-pulse">
      <div className="h-28 w-full" style={{ background: "var(--glass-bg-subtle)" }} />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-4 w-3/4 rounded" style={{ background: "var(--glass-bg-subtle)" }} />
        <div className="h-3 w-full rounded" style={{ background: "var(--glass-bg-subtle)" }} />
        <div className="h-3 w-2/3 rounded" style={{ background: "var(--glass-bg-subtle)" }} />
        <div className="h-9 w-full rounded-xl mt-2" style={{ background: "var(--glass-bg-subtle)" }} />
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardCommunityPage() {
  const { data: session } = useSession();
  const [view, setView] = useState<"list" | "create">("list");
  const [communities, setCommunities] = useState<JoinedCommunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leaving, setLeaving] = useState<string | null>(null);
  const [confirmLeave, setConfirmLeave] = useState<JoinedCommunity | null>(null);

  // Create form state
  const [form, setForm] = useState({ name: "", slug: "", description: "", category: "", image: "" });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => { fetchMyCommunities(); }, []);

  async function fetchMyCommunities() {
    try {
      const res = await fetch("/api/communities/my");
      if (!res.ok) throw new Error("Failed to fetch");
      setCommunities(await res.json());
    } catch {
      setError("Failed to load your communities. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleLeaveRequest(slug: string) {
    const target = communities.find((c) => c.community.slug === slug);
    if (target) setConfirmLeave(target);
  }

  async function handleLeaveConfirm() {
    if (!confirmLeave || leaving) return;
    const slug = confirmLeave.community.slug;
    setLeaving(slug);
    setError(null);
    try {
      const res = await fetch(`/api/communities/${slug}/join`, { method: "POST" });
      if (!res.ok) throw new Error();
      setCommunities((prev) => prev.filter((c) => c.community.slug !== slug));
    } catch {
      setError("Failed to leave community. Please try again.");
    } finally {
      setLeaving(null);
      setConfirmLeave(null);
    }
  }

  function handleName(value: string) {
    setForm((f) => ({
      ...f,
      name: value,
      slug: value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    }));
  }

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setFormError(null);
    try {
      const fd = new FormData();
      fd.append("files", file);
      fd.append("folder", "communities");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForm((f) => ({ ...f, image: data.uploads.url }));
    } catch (err: any) {
      setFormError(err.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!form.name || !form.slug || !form.description || !form.category) {
      setFormError("Please fill in all required fields.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForm({ name: "", slug: "", description: "", category: "", image: "" });
      await fetchMyCommunities();
      setView("list");
    } catch (err: any) {
      setFormError(err.message || "Failed to create community");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <AnimatePresence>
        {confirmLeave && (
          <LeaveConfirmDialog
            communityName={confirmLeave.community.name}
            onConfirm={handleLeaveConfirm}
            onCancel={() => setConfirmLeave(null)}
            loading={!!leaving}
          />
        )}
      </AnimatePresence>

      <div className="space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
              {view === "create" ? "Create Community" : "My Communities"}
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              {view === "create"
                ? "Fill in the details below to launch your community"
                : loading
                  ? "Loading your communities..."
                  : communities.length > 0
                    ? `You're a member of ${communities.length} communit${communities.length === 1 ? "y" : "ies"}`
                    : "You haven't joined any communities yet"}
            </p>
          </div>

          <div className="self-start sm:self-auto flex items-center gap-2">
            {view === "list" ? (
              <>
                <Link href="/community" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.01]" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--text-secondary)" }}>
                  <Globe size={14} /> Explore More
                </Link>
                <button onClick={() => setView("create")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.01]" style={{ background: "linear-gradient(135deg, var(--scarlet), var(--purple))", boxShadow: "0 4px 14px rgba(220,20,60,0.3)" }}>
                  <Plus size={14} /> Create Community
                </button>
              </>
            ) : (
              <button onClick={() => setView("list")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.01]" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--text-secondary)" }}>
                <ChevronLeft size={14} /> Back
              </button>
            )}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {view === "create" ? (
            // ── Create Form ──────────────────────────────────────────────────
            <motion.div key="create" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
              <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 flex flex-col gap-5 max-w-2xl">
                {/* Cover image */}
                <label className="cursor-pointer">
                  <div className="w-full h-40 rounded-xl flex items-center justify-center overflow-hidden" style={{ border: "2px dashed var(--glass-border)", background: "var(--glass-bg-subtle)" }}>
                    {form.image ? (
                      <img src={form.image} alt="cover" className="w-full h-full object-cover" />
                    ) : uploading ? (
                      <Loader2 size={24} className="animate-spin" style={{ color: "var(--text-muted)" }} />
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <ImageIcon size={28} style={{ color: "var(--text-muted)" }} />
                        <span className="text-sm" style={{ color: "var(--text-muted)" }}>Click to upload cover image (optional)</span>
                      </div>
                    )}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImage} disabled={uploading} />
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Community Name *</label>
                    <input
                      className="w-full rounded-xl px-4 py-2.5 text-sm"
                      style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--text-primary)", outline: "none" }}
                      value={form.name}
                      onChange={(e) => handleName(e.target.value)}
                      placeholder="e.g. Cameroon Youth Leaders"
                      required
                    />
                  </div>

                  {/* Slug */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Slug *</label>
                    <input
                      className="w-full rounded-xl px-4 py-2.5 text-sm font-mono"
                      style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--text-primary)", outline: "none" }}
                      value={form.slug}
                      onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }))}
                      placeholder="cameroon-youth-leaders"
                      required
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Category *</label>
                  <select
                    className="w-full rounded-xl px-4 py-2.5 text-sm"
                    style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: form.category ? "var(--text-primary)" : "var(--text-muted)", outline: "none" }}
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    required
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Description *</label>
                  <textarea
                    className="w-full rounded-xl px-4 py-2.5 text-sm resize-none"
                    style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--text-primary)", outline: "none" }}
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="What is this community about?"
                    required
                  />
                </div>

                {formError && <p className="text-xs font-medium" style={{ color: "var(--scarlet)" }}>{formError}</p>}

                <div className="flex gap-3">
                  <button type="button" onClick={() => setView("list")} className="px-6 py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.01]" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--text-secondary)" }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={saving || uploading} className="flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50" style={{ background: "linear-gradient(135deg, var(--scarlet), var(--purple))", boxShadow: "0 4px 14px rgba(220,20,60,0.3)" }}>
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    {saving ? "Creating..." : "Create Community"}
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            // ── List View ────────────────────────────────────────────────────
            <motion.div key="list" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }} className="space-y-8">
              {/* Summary stats */}
              {!loading && communities.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: "Communities Joined", value: communities.length, icon: Globe },
                    { label: "Total Members", value: communities.reduce((acc, c) => acc + c.community.memberCount, 0).toLocaleString(), icon: Users },
                    { label: "Total Posts", value: communities.reduce((acc, c) => acc + c.community.postCount, 0).toLocaleString(), icon: FileText },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="glass rounded-2xl p-4 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Icon size={14} style={{ color: "var(--text-muted)" }} />
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</span>
                      </div>
                      <span className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <div className="glass rounded-2xl p-4 text-sm font-medium" style={{ color: "var(--scarlet)" }}>{error}</div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
                ) : communities.length === 0 ? (
                  <EmptyState onCreate={() => setView("create")} />
                ) : (
                  communities.map((item, i) => (
                    <CommunityCard key={item.membershipId} item={item} index={i} onLeave={handleLeaveRequest} leaving={leaving} />
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
