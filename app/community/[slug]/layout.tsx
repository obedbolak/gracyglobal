"use client";

import { use, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  Pencil,
  Loader2,
  ImageIcon,
  Check,
  X,
  ArrowLeft,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { useCommunityMembership } from "@/context/CommunityMembershipContext";
import ShareButton from "@/components/shared/ShareButton";

type TabId = "feed" | "projects" | "events" | "resources" | "members";

const TAB_LABELS: Record<TabId, string> = {
  feed: "Discussions",
  projects: "Projects",
  events: "Events",
  resources: "Resources",
  members: "Members",
};

const TAB_ORDER: TabId[] = [
  "feed",
  "projects",
  "events",
  "resources",
  "members",
];

const TAB_ICONS: Record<TabId, React.ReactNode> = {
  feed: (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  projects: (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  ),
  events: (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  resources: (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  members: (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
};

interface CommunityEditForm {
  name: string;
  description: string;
  category: string;
  image: string;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function getActiveTab(pathname: string): TabId {
  if (pathname.includes("/projects")) return "projects";
  if (pathname.includes("/events")) return "events";
  if (pathname.includes("/resources")) return "resources";
  if (pathname.includes("/members")) return "members";
  return "feed";
}

export default function CommunityLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const {
    loading: membershipLoading,
    setSelectedSlug,
    selectedCommunity,
    memberships,
    isMember,
    refresh,
  } = useCommunityMembership();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<CommunityEditForm>({
    name: "",
    description: "",
    category: "",
    image: "",
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const activeTab = getActiveTab(pathname);
  const isAdmin = memberships.some(
    (m) => m.community.slug === slug && m.role === "ADMIN",
  );

  // Update context when slug changes
  useEffect(() => {
    if (slug && !membershipLoading) {
      setSelectedSlug(slug);
    }
  }, [slug, membershipLoading, setSelectedSlug]);

  // Sync edit form with selected community
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
  }, [slug, selectedCommunity]);

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

  function goBackToBrowse() {
    router.push("/community");
  }

  function switchCommunity(communitySlug: string) {
    router.push(`/community/${communitySlug}`);
  }

  function navigateToTab(tab: TabId) {
    if (tab === "feed") {
      router.push(`/community/${slug}`);
    } else {
      router.push(`/community/${slug}/${tab}`);
    }
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
    } catch (err: unknown) {
      setEditError(getErrorMessage(err, "Image upload failed"));
    } finally {
      setUploading(false);
    }
  }

  async function handleEditSave() {
    if (!slug) return;
    setSaving(true);
    setEditError(null);
    try {
      const res = await fetch(`/api/communities/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      refresh();
      setEditing(false);
    } catch (err: unknown) {
      setEditError(getErrorMessage(err, "Failed to save changes"));
    } finally {
      setSaving(false);
    }
  }

  // Close drawer on tab navigation
  useEffect(() => {
    setDrawerOpen(false);
  }, [activeTab]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (drawerOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [drawerOpen]);

  const SidebarBody = () => (
    <div className="flex flex-col gap-4">
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
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid var(--glass-border)" }}
        >
          {/* Cover image */}
          <div
            className="h-24 w-full relative"
            style={{
              background:
                "linear-gradient(135deg, var(--scarlet), var(--purple))",
            }}
          >
            {selectedCommunity.image && (
              <img
                src={selectedCommunity.image}
                alt={selectedCommunity.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="p-4" style={{ background: "var(--glass-bg)" }}>
            <h2
              className="font-extrabold text-base leading-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {selectedCommunity.name}
            </h2>
            <p
              className="text-xs mt-1 leading-relaxed"
              style={{ color: "var(--text-muted)" }}
            >
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
            <ShareButton
              href={`/community/${selectedCommunity.slug}`}
              title={`Join ${selectedCommunity.name} on GracyGlobal`}
              text={selectedCommunity.description}
              className="mt-3 w-full !min-h-0 !py-2"
            />
            {isAdmin && !editing && (
              <button
                onClick={() => {
                  setEditing(true);
                  setDrawerOpen(false);
                }}
                className="mt-3 w-full inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors"
                style={{
                  borderColor: "var(--glass-border)",
                  color: "var(--text-secondary)",
                }}
              >
                <Pencil className="h-3 w-3" /> Edit community
              </button>
            )}
          </div>
        </div>
      )}

      {/* My other communities */}
      {memberships.filter((m) => m.community.slug !== slug).length > 0 && (
        <div
          className="rounded-2xl p-4"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <p
            className="text-[11px] font-bold uppercase tracking-widest mb-3"
            style={{ color: "var(--text-muted)" }}
          >
            My Communities
          </p>
          <div className="space-y-2">
            {memberships
              .filter((m) => m.community.slug !== slug)
              .map(({ community, role }) => (
                <button
                  key={community.id}
                  onClick={() => switchCommunity(community.slug)}
                  className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left transition-all hover:scale-[1.01]"
                  style={{
                    background: "var(--glass-bg-subtle)",
                    border: "1px solid var(--glass-border)",
                  }}
                >
                  {community.image ? (
                    <img
                      src={community.image}
                      alt={community.name}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--scarlet), var(--purple))",
                      }}
                    >
                      {community.name[0]}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p
                      className="text-xs font-semibold truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {community.name}
                    </p>
                    <p
                      className="text-[10px] capitalize"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {role.toLowerCase()}
                    </p>
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Tabs as nav */}
      <nav
        className="rounded-2xl overflow-hidden"
        style={{
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
        }}
      >
        {TAB_ORDER.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => navigateToTab(tab)}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-left transition-all"
              style={{
                background: isActive
                  ? "linear-gradient(135deg, var(--purple), var(--scarlet))"
                  : "transparent",
                color: isActive ? "#fff" : "var(--text-secondary)",
                borderBottom: "1px solid var(--glass-border)",
              }}
            >
              {TAB_ICONS[tab]}
              {TAB_LABELS[tab]}
            </button>
          );
        })}
      </nav>
    </div>
  );

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="text-center p-6 rounded-2xl border"
          style={{
            borderColor: "var(--card-border)",
            background: "var(--card-bg)",
          }}
        >
          <p style={{ color: "var(--text-muted)" }} className="mb-4">
            Please log in to access communities
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-2 rounded-lg text-white font-semibold"
            style={{
              background:
                "linear-gradient(135deg, var(--purple), var(--scarlet))",
            }}
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (membershipLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2
          className="h-6 w-6 animate-spin"
          style={{ color: "var(--text-muted)" }}
        />
      </div>
    );
  }

  if (!isMember(slug)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="text-center p-6 rounded-2xl border max-w-sm"
          style={{
            borderColor: "var(--card-border)",
            background: "var(--card-bg)",
          }}
        >
          <p style={{ color: "var(--text-muted)" }} className="mb-4">
            You&apos;re not a member of this community yet.
          </p>
          <button
            onClick={goBackToBrowse}
            className="inline-block px-6 py-2 rounded-lg text-white font-semibold"
            style={{
              background:
                "linear-gradient(135deg, var(--purple), var(--scarlet))",
            }}
          >
            Browse Communities
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen relative mb-16">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
        <div className="flex gap-6 items-start">
          {/* ── Desktop sidebar ── */}
          <aside className="hidden lg:flex flex-col w-72 flex-shrink-0 pr-1">
            <SidebarBody />
          </aside>

          {/* ── Mobile slide-over drawer ── */}
          <AnimatePresence>
            {drawerOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setDrawerOpen(false)}
                  className="fixed inset-0 z-[60] bg-black/50 lg:hidden"
                />
                {/* Panel */}
                <motion.aside
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "tween", duration: 0.25 }}
                  className="fixed left-0 top-0 z-[70] h-full w-[85%] max-w-sm overflow-y-auto p-4 lg:hidden no-scrollbar"
                  style={{ background: "var(--card-bg)" }}
                >
                  <div className="flex justify-end mb-2">
                    <button
                      onClick={() => setDrawerOpen(false)}
                      className="rounded-lg p-1.5 transition-colors hover:bg-black/5"
                      aria-label="Close menu"
                    >
                      <X
                        className="h-5 w-5"
                        style={{ color: "var(--text-muted)" }}
                      />
                    </button>
                  </div>
                  <SidebarBody />
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0 flex flex-col h-full">
            {/* Mobile header: menu trigger + back + horizontal tabs */}
            <div className="lg:hidden mb-4">
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold"
                  style={{
                    borderColor: "var(--glass-border)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <Menu className="h-4 w-4" /> Menu
                </button>
                <button
                  onClick={goBackToBrowse}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold"
                  style={{ color: "var(--text-muted)" }}
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
              </div>

              <div
                className="flex gap-1.5 overflow-x-auto pb-1"
                style={{ scrollbarWidth: "none" }}
              >
                {TAB_ORDER.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => navigateToTab(tab)}
                    className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                    style={{
                      background:
                        activeTab === tab
                          ? "linear-gradient(135deg, var(--purple), var(--scarlet))"
                          : "var(--glass-bg)",
                      color:
                        activeTab === tab ? "#fff" : "var(--text-secondary)",
                      border:
                        activeTab === tab
                          ? "none"
                          : "1px solid var(--glass-border)",
                    }}
                  >
                    {TAB_LABELS[tab]}
                  </button>
                ))}
              </div>
            </div>

            {/* Edit form */}
            {editing && (
              <div className="mb-6">
                <CommunityEditForm
                  editForm={editForm}
                  setEditForm={setEditForm}
                  onCancel={() => {
                    setEditing(false);
                    resetEditForm();
                  }}
                  onSave={handleEditSave}
                  onImageChange={handleEditImage}
                  uploading={uploading}
                  saving={saving}
                  error={editError}
                />
              </div>
            )}

            {/* Tab content */}
            <div className="flex-1 min-h-0">{children}</div>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/* Edit Form Component                                                  */
/* ─────────────────────────────────────────────────────────────────── */

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
  editForm: CommunityEditForm;
  setEditForm: React.Dispatch<React.SetStateAction<CommunityEditForm>>;
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
        borderColor: "var(--card-border)",
        background: "var(--card-bg)",
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
            style={{ borderColor: "var(--card-border)" }}
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
            <input
              type="file"
              accept="image/*"
              onChange={onImageChange}
              disabled={uploading}
              className="hidden"
            />
          </label>
          {uploading && (
            <p
              className="mt-1 text-xs text-center"
              style={{ color: "var(--text-muted)" }}
            >
              Uploading...
            </p>
          )}
        </div>

        {/* Form fields */}
        <div className="flex flex-col gap-4">
          {error && (
            <p
              className="text-xs p-2 rounded-lg"
              style={{
                color: "#dc143c",
                background: "rgba(220,20,60,0.1)",
              }}
            >
              {error}
            </p>
          )}

          {/* Name */}
          <div>
            <label
              className="mb-1.5 block text-xs font-semibold"
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
                borderColor: "var(--card-border)",
                background: "var(--input-bg)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Category */}
          <div>
            <label
              className="mb-1.5 block text-xs font-semibold"
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
                borderColor: "var(--card-border)",
                background: "var(--input-bg)",
                color: "var(--text-primary)",
              }}
            >
              <option value="">Select category</option>
              <option value="Health & Environment">Health & Environment</option>
              <option value="Education & Knowledge">
                Education & Knowledge
              </option>
              <option value="Governance & Law">Governance & Law</option>
              <option value="Economic Empowerment">Economic Empowerment</option>
              <option value="Youth Empowerment">Youth Empowerment</option>
              <option value="Women Empowerment">Women Empowerment</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label
              className="mb-1.5 block text-xs font-semibold"
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
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none resize-none"
              style={{
                borderColor: "var(--card-border)",
                background: "var(--input-bg)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="rounded-lg border px-4 py-2 text-sm font-semibold transition-colors"
              style={{
                borderColor: "var(--glass-border)",
                color: "var(--text-secondary)",
              }}
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity inline-flex items-center gap-2"
              style={{
                background:
                  "linear-gradient(135deg, var(--purple), var(--scarlet))",
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" /> Save
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
