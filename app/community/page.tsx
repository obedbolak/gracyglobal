// app/community/page.tsx

"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  Pencil,
  Loader2,
  ImageIcon,
  Check,
  X,
  Search,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

import CommunityFeed from "@/components/community/CommunityFeed";

type TabId = "feed" | "projects" | "events" | "resources" | "members";
import {
  CommunityProjects,
  CommunityEvents,
  CommunityResources,
  CommunityMembers,
} from "@/components/community/CommunityContent";
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

// Used only as a fallback when a community has no image of its own.
const FALLBACK_CARD_IMAGE =
  "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=80";

interface CommunitySummary {
  slug: string;
  name: string;
  description: string;
  memberCount?: number;
  image?: string;
}

function CommunityPageContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  const {
    isAnyMember,
    loading: membershipLoading,
    selectedSlug,
    setSelectedSlug,
    selectedCommunity,
    memberships,
    isMember,
    refresh,
  } = useCommunityMembership();

  const [view, setView] = useState<"browse" | "community">("browse");
  const [activeTab, setActiveTab] = useState<TabId>("feed");
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    category: "",
    image: "",
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const isAdmin = memberships.some(
    (m) => m.community.slug === selectedSlug && m.role === "ADMIN",
  );

  useEffect(() => {
    if (selectedCommunity) {
      setEditForm({
        name: selectedCommunity.name,
        description: selectedCommunity.description,
        category: selectedCommunity.category,
        image: selectedCommunity.image ?? "",
      });
      setEditing(false);
      setEditError(null);
    }
  }, [selectedSlug]);

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

  function resetEditForm() {
    if (selectedCommunity) {
      setEditForm({
        name: selectedCommunity.name,
        description: selectedCommunity.description,
        category: selectedCommunity.category,
        image: selectedCommunity.image ?? "",
      });
    }
    setEditError(null);
  }

  function openCommunity(slug: string) {
    setSelectedSlug(slug);
    setView("community");
  }

  function goBackToBrowse() {
    setView("browse");
  }

  async function handleEditImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setEditError(null);
    try {
      const fd = new FormData();
      fd.append("files", file);
      fd.append("folder", "communities");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEditForm((f) => ({ ...f, image: data.uploads.url }));
    } catch (err: any) {
      setEditError(err.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleEditSave() {
    if (!selectedSlug) return;
    setSaving(true);
    setEditError(null);
    try {
      const res = await fetch(`/api/communities/${selectedSlug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      refresh();
      setEditing(false);
    } catch (err: any) {
      setEditError(err.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  async function handleJoin(slug: string, communityName: string) {
    if (!isLoggedIn) {
      const dest = encodeURIComponent(`/community?slug=${slug}&autoJoin=${slug}`);
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

  // Read ?slug= param and sync it into context
  useEffect(() => {
    const slugParam = searchParams.get("slug");
    if (slugParam && memberships.length > 0) {
      const match = memberships.find((m) => m.community.slug === slugParam);
      if (match) {
        setSelectedSlug(slugParam);
        setView("community");
      }
    }
  }, [searchParams, memberships]);

  // Auto-join after login/register callback
  useEffect(() => {
    const autoJoin = searchParams.get("autoJoin");
    if (!autoJoin || !isLoggedIn || membershipLoading) return;
    if (isMember(autoJoin)) {
      openCommunity(autoJoin);
      return;
    }
    handleJoin(autoJoin, autoJoin);
  }, [searchParams, isLoggedIn, membershipLoading]);

  // Reset tab when community changes
  useEffect(() => {
    setActiveTab("feed");
  }, [selectedSlug]);

  return (
    <main className="min-h-screen relative mb-15">
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

      {view === "browse" && (
        <>
          {/* Search — for members and guests alike */}
          <section className="max-w-7xl mx-auto px-4 pt-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-xl">
              <CommunitySearchBar
                value={searchQuery}
                onChange={setSearchQuery}
              />
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
        </>
      )}

      {/* Member hub — sidebar + content */}
      {view === "community" && isLoggedIn && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
          {membershipLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--text-muted)" }} />
            </div>
          ) : !isAnyMember ? (
            <div className="rounded-2xl border px-6 py-16 text-center text-sm" style={{ borderColor: "var(--border-color, rgba(0,0,0,0.08))", color: "var(--text-muted)" }}>
              You're not a member of this community yet.
            </div>
          ) : (
            <div className="flex gap-6 items-start">

              {/* ── Sidebar ── */}
              <aside className="hidden lg:flex flex-col gap-4 w-72 flex-shrink-0 sticky top-20">

                {/* Back button */}
                <button
                  onClick={goBackToBrowse}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors hover:opacity-70 self-start"
                  style={{ color: "var(--text-muted)" }}
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>

                {/* Selected community card */}
                {selectedCommunity && (
                  <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--glass-border)" }}>
                    {/* Cover image */}
                    <div className="h-24 w-full relative" style={{ background: "linear-gradient(135deg, var(--scarlet), var(--purple))" }}>
                      {selectedCommunity.image && (
                        <img src={selectedCommunity.image} alt={selectedCommunity.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="p-4" style={{ background: "var(--glass-bg)" }}>
                      <h2 className="font-extrabold text-base leading-tight" style={{ color: "var(--text-primary)" }}>
                        {selectedCommunity.name}
                      </h2>
                      <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                        {selectedCommunity.description}
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {selectedCommunity.memberCount} members
                        </span>
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {selectedCommunity.postCount} posts
                        </span>
                      </div>
                      {isAdmin && !editing && (
                        <button
                          onClick={() => setEditing(true)}
                          className="mt-3 w-full inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors"
                          style={{ borderColor: "var(--glass-border)", color: "var(--text-secondary)" }}
                        >
                          <Pencil className="h-3 w-3" /> Edit community
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* My other communities */}
                {memberships.filter((m) => m.community.slug !== selectedSlug).length > 0 && (
                  <div className="rounded-2xl p-4" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                    <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>My Communities</p>
                    <div className="space-y-2">
                      {memberships
                        .filter((m) => m.community.slug !== selectedSlug)
                        .map(({ community, role }) => (
                          <button
                            key={community.id}
                            onClick={() => { setSelectedSlug(community.slug); setActiveTab("feed"); }}
                            className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left transition-all hover:scale-[1.01]"
                            style={{ background: "var(--glass-bg-subtle)", border: "1px solid var(--glass-border)" }}
                          >
                            {community.image ? (
                              <img src={community.image} alt={community.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white" style={{ background: "linear-gradient(135deg, var(--scarlet), var(--purple))" }}>
                                {community.name[0]}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>{community.name}</p>
                              <p className="text-[10px] capitalize" style={{ color: "var(--text-muted)" }}>{role.toLowerCase()}</p>
                            </div>
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {/* Tabs as nav */}
                <nav className="rounded-2xl overflow-hidden" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                  {(["feed", "projects", "events", "resources", "members"] as TabId[]).map((tab) => {
                    const labels: Record<TabId, string> = { feed: "Discussions", projects: "Projects", events: "Events", resources: "Resources", members: "Members" };
                    const icons: Record<TabId, React.ReactNode> = {
                      feed: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
                      projects: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>,
                      events: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
                      resources: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
                      members: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
                    };
                    const isActive = activeTab === tab;
                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-left transition-all"
                        style={{
                          background: isActive ? "linear-gradient(135deg, var(--purple), var(--scarlet))" : "transparent",
                          color: isActive ? "#fff" : "var(--text-secondary)",
                          borderBottom: "1px solid var(--glass-border)",
                        }}
                      >
                        {icons[tab]}
                        {labels[tab]}
                      </button>
                    );
                  })}
                </nav>
              </aside>

              {/* ── Main content ── */}
              <div className="flex-1 min-w-0">
                {/* Mobile back + tabs */}
                <div className="lg:hidden mb-4">
                  <button onClick={goBackToBrowse} className="inline-flex items-center gap-1.5 text-sm font-semibold mb-3" style={{ color: "var(--text-muted)" }}>
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                    {(["feed", "projects", "events", "resources", "members"] as TabId[]).map((tab) => {
                      const labels: Record<TabId, string> = { feed: "Discussions", projects: "Projects", events: "Events", resources: "Resources", members: "Members" };
                      return (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                          className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                          style={{
                            background: activeTab === tab ? "linear-gradient(135deg, var(--purple), var(--scarlet))" : "var(--glass-bg)",
                            color: activeTab === tab ? "#fff" : "var(--text-secondary)",
                            border: activeTab === tab ? "none" : "1px solid var(--glass-border)",
                          }}
                        >{labels[tab]}</button>
                      );
                    })}
                  </div>
                </div>

                {/* Edit form */}
                {editing && (
                  <div className="mb-6">
                    <CommunityEditForm
                      editForm={editForm}
                      setEditForm={setEditForm}
                      onCancel={() => { setEditing(false); resetEditForm(); }}
                      onSave={handleEditSave}
                      onImageChange={handleEditImage}
                      uploading={uploading}
                      saving={saving}
                      error={editError}
                    />
                  </div>
                )}

                {/* Tab content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${selectedSlug}-${activeTab}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                  >
                    {activeTab === "feed" && selectedSlug && <CommunityFeed communitySlug={selectedSlug} />}
                    {activeTab === "projects" && selectedSlug && <CommunityProjects communitySlug={selectedSlug} />}
                    {activeTab === "events" && selectedSlug && <CommunityEvents communitySlug={selectedSlug} />}
                    {activeTab === "resources" && selectedSlug && <CommunityResources communitySlug={selectedSlug} />}
                    {activeTab === "members" && selectedSlug && <CommunityMembers communitySlug={selectedSlug} />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

/* ----------------------------------------------------------------- */
/* Search bar                                                         */
/* ----------------------------------------------------------------- */

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
          borderColor: "var(--border-color, rgba(0,0,0,0.12))",
          color: "var(--text-primary)",
          background: "var(--card-bg, var(--bg-primary, #ffffff))",
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

/* ----------------------------------------------------------------- */
/* Admin inline edit form — same page, driven entirely by `editing`  */
/* ----------------------------------------------------------------- */

function CommunityEditForm({
  editForm,
  setEditForm,
  onCancel,
  onSave,
  onImageChange,
  uploading,
  saving,
  error,
}: {
  editForm: {
    name: string;
    description: string;
    category: string;
    image: string;
  };
  setEditForm: React.Dispatch<
    React.SetStateAction<{
      name: string;
      description: string;
      category: string;
      image: string;
    }>
  >;
  onCancel: () => void;
  onSave: () => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
  saving: boolean;
  error: string | null;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-5"
      style={{
        borderColor: "var(--border-color, rgba(0,0,0,0.1))",
        background: "var(--card-bg, var(--bg-primary, #ffffff))",
      }}
    >
      <div className="flex items-center justify-between">
        <h3
          className="text-sm font-bold uppercase tracking-wide"
          style={{ color: "var(--text-primary)" }}
        >
          Edit community
        </h3>
        <button
          onClick={onCancel}
          className="rounded-lg p-1.5 transition-colors hover:bg-black/5"
          aria-label="Cancel editing"
        >
          <X className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[160px_1fr]">
        {/* Image */}
        <div>
          <label
            className="mb-1.5 block text-xs font-semibold"
            style={{ color: "var(--text-muted)" }}
          >
            Image
          </label>
          <label
            className="relative flex h-32 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border lg:w-40"
            style={{ borderColor: "var(--border-color, rgba(0,0,0,0.12))" }}
          >
            {editForm.image ? (
              <img
                src={editForm.image}
                alt="Community"
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageIcon
                className="h-6 w-6"
                style={{ color: "var(--text-muted)" }}
              />
            )}
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>

        {/* Fields */}
        <div className="space-y-3">
          <div>
            <label
              className="mb-1 block text-xs font-semibold"
              style={{ color: "var(--text-muted)" }}
            >
              Name
            </label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, name: e.target.value }))
              }
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
              style={{
                borderColor: "var(--border-color, rgba(0,0,0,0.12))",
                color: "var(--text-primary)",
                background: "var(--bg-primary, #ffffff)",
              }}
            />
          </div>

          <div>
            <label
              className="mb-1 block text-xs font-semibold"
              style={{ color: "var(--text-muted)" }}
            >
              Description
            </label>
            <textarea
              value={editForm.description}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={3}
              className="w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none"
              style={{
                borderColor: "var(--border-color, rgba(0,0,0,0.12))",
                color: "var(--text-primary)",
                background: "var(--bg-primary, #ffffff)",
              }}
            />
          </div>

          <div>
            <label
              className="mb-1 block text-xs font-semibold"
              style={{ color: "var(--text-muted)" }}
            >
              Category
            </label>
            <select
              value={editForm.category}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, category: e.target.value }))
              }
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
              style={{
                borderColor: "var(--border-color, rgba(0,0,0,0.12))",
                color: "var(--text-primary)",
                background: "var(--bg-primary, #ffffff)",
              }}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-3 text-xs font-semibold text-red-600">{error}</p>
      )}

      <div className="mt-5 flex items-center justify-end gap-2">
        <button
          onClick={onCancel}
          disabled={saving}
          className="rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-50"
          style={{
            borderColor: "var(--border-color, rgba(0,0,0,0.12))",
            color: "var(--text-primary)",
          }}
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={saving || uploading}
          className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-neutral-900"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </motion.div>
  );
}

/* ----------------------------------------------------------------- */
/* Browse grid — every card is its own image, text overlaid           */
/* ----------------------------------------------------------------- */

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
              style={{ background: "var(--card-bg, rgba(0,0,0,0.06))" }}
            />
          ))}
        </div>
      ) : communities.length === 0 ? (
        <div
          className="rounded-2xl border px-6 py-16 text-center text-sm"
          style={{
            borderColor: "var(--border-color, rgba(0,0,0,0.08))",
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
