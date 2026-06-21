"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Pencil, Users, ChevronDown,
  Loader2, X, ImageIcon, Check, Search,
} from "lucide-react";

const CATEGORIES = [
  "Health & Environment", "Education & Knowledge", "Governance & Law",
  "Economic Empowerment", "Youth Empowerment", "Women Empowerment", "Other",
];
const ROLES = ["MEMBER", "MODERATOR", "ADMIN"] as const;

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  category: string;
  _count: { members: number; posts: number };
}

interface Member {
  id: string;
  role: "MEMBER" | "MODERATOR" | "ADMIN";
  joinedAt: string;
  user: { id: string; name: string | null; image: string | null; country: string | null };
}

const EMPTY_FORM = { name: "", slug: "", description: "", category: "", image: "" };

export default function AdminCommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  // create / edit
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [editTarget, setEditTarget] = useState<Community | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // members panel
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [roleUpdating, setRoleUpdating] = useState<string | null>(null);
  const [removingMember, setRemovingMember] = useState<string | null>(null);

  // delete
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  useEffect(() => { fetchCommunities(); }, []);

  async function fetchCommunities() {
    setLoading(true);
    try {
      const res = await fetch("/api/communities");
      const data = await res.json();
      setCommunities(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  // ── Members ───────────────────────────────────────────────────────────────

  async function toggleMembers(slug: string) {
    if (openSlug === slug) { setOpenSlug(null); return; }
    setOpenSlug(slug);
    setMembersLoading(true);
    try {
      const res = await fetch(`/api/communities/${slug}/members`);
      setMembers(await res.json());
    } finally {
      setMembersLoading(false);
    }
  }

  async function handleRoleChange(slug: string, memberId: string, role: string) {
    setRoleUpdating(memberId);
    try {
      await fetch(`/api/communities/${slug}/members`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, role }),
      });
      setMembers((prev) => prev.map((m) => m.id === memberId ? { ...m, role: role as Member["role"] } : m));
    } finally {
      setRoleUpdating(null);
    }
  }

  async function handleRemoveMember(slug: string, memberId: string) {
    setRemovingMember(memberId);
    try {
      await fetch(`/api/communities/${slug}/members`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } finally {
      setRemovingMember(null);
    }
  }

  // ── Delete community ──────────────────────────────────────────────────────

  async function handleDelete(slug: string) {
    if (!confirm("Delete this community and all its data? This cannot be undone.")) return;
    setDeletingSlug(slug);
    try {
      await fetch(`/api/communities/${slug}`, { method: "DELETE" });
      setCommunities((prev) => prev.filter((c) => c.slug !== slug));
      if (openSlug === slug) setOpenSlug(null);
    } finally {
      setDeletingSlug(null);
    }
  }

  // ── Create / Edit ─────────────────────────────────────────────────────────

  function openCreate() {
    setForm({ ...EMPTY_FORM });
    setEditTarget(null);
    setFormError(null);
    setView("create");
  }

  function openEdit(c: Community) {
    setForm({ name: c.name, slug: c.slug, description: c.description, category: c.category, image: c.image ?? "" });
    setEditTarget(c);
    setFormError(null);
    setView("edit");
  }

  function handleName(value: string) {
    setForm((f) => ({
      ...f,
      name: value,
      slug: view === "create"
        ? value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
        : f.slug,
    }));
  }

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
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
      if (view === "create") {
        const res = await fetch("/api/communities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
      } else if (editTarget) {
        const res = await fetch(`/api/communities/${editTarget.slug}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
      }
      await fetchCommunities();
      setView("list");
    } catch (err: any) {
      setFormError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (view === "create" || view === "edit") {
    return (
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>
              {view === "create" ? "Create Community" : "Edit Community"}
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              {view === "create" ? "Add a new community to the platform" : `Editing: ${editTarget?.name}`}
            </p>
          </div>
          <button onClick={() => setView("list")} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-[1.01]" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--text-secondary)" }}>
            <X size={14} /> Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 flex flex-col gap-5">
          {/* Cover image */}
          <label className="cursor-pointer">
            <div className="w-full h-36 rounded-xl overflow-hidden flex items-center justify-center" style={{ border: "2px dashed var(--glass-border)", background: "var(--glass-bg-subtle)" }}>
              {form.image ? (
                <img src={form.image} alt="cover" className="w-full h-full object-cover" />
              ) : uploading ? (
                <Loader2 size={24} className="animate-spin" style={{ color: "var(--text-muted)" }} />
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <ImageIcon size={26} style={{ color: "var(--text-muted)" }} />
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>Upload cover image (optional)</span>
                </div>
              )}
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleImage} disabled={uploading} />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Name *</label>
              <input className="rounded-xl px-4 py-2.5 text-sm" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--text-primary)", outline: "none" }} value={form.name} onChange={(e) => handleName(e.target.value)} placeholder="Community name" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Slug *</label>
              <input className="rounded-xl px-4 py-2.5 text-sm font-mono" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--text-primary)", outline: "none" }} value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }))} placeholder="community-slug" required />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Category *</label>
            <select className="rounded-xl px-4 py-2.5 text-sm" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: form.category ? "var(--text-primary)" : "var(--text-muted)", outline: "none" }} value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} required>
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Description *</label>
            <textarea className="rounded-xl px-4 py-2.5 text-sm resize-none" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--text-primary)", outline: "none" }} rows={4} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="What is this community about?" required />
          </div>

          {formError && <p className="text-xs font-medium" style={{ color: "var(--scarlet)" }}>{formError}</p>}

          <button type="submit" disabled={saving || uploading} className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50" style={{ background: "linear-gradient(135deg, var(--scarlet), var(--purple))", boxShadow: "0 4px 14px rgba(220,20,60,0.3)" }}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            {saving ? "Saving..." : view === "create" ? "Create Community" : "Save Changes"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>Communities</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{communities.length} communities on the platform</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.01]" style={{ background: "linear-gradient(135deg, var(--scarlet), var(--purple))", boxShadow: "0 4px 14px rgba(220,20,60,0.3)" }}>
          <Plus size={14} /> Add Community
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-20 glass rounded-2xl animate-pulse" />)}
        </div>
      ) : communities.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center" style={{ color: "var(--text-muted)" }}>No communities yet.</div>
      ) : (
        <div className="space-y-3">
          {communities.map((c) => (
            <div key={c.id} className="glass rounded-2xl overflow-hidden">
              {/* Community row */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4">
                {/* Image + info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--scarlet), var(--purple))" }}>
                    {c.image && <img src={c.image} alt={c.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate" style={{ color: "var(--text-primary)" }}>{c.name}</p>
                    <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{c.category}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{c._count?.members ?? 0} members · {c._count?.posts ?? 0} posts</p>
                  </div>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => toggleMembers(c.slug)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-[1.01]" style={{ background: openSlug === c.slug ? "var(--purple-bg, rgba(123,47,190,0.15))" : "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--text-secondary)" }}>
                    <Users size={12} />
                    <span className="hidden sm:inline">Members</span>
                    <ChevronDown size={12} style={{ transform: openSlug === c.slug ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                  </button>
                  <button onClick={() => openEdit(c)} className="p-2 rounded-xl transition-all hover:scale-[1.01]" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--text-secondary)" }}>
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => handleDelete(c.slug)} disabled={deletingSlug === c.slug} className="p-2 rounded-xl transition-all hover:scale-[1.01] disabled:opacity-50" style={{ background: "rgba(220,20,60,0.1)", border: "1px solid rgba(220,20,60,0.2)", color: "var(--scarlet)" }}>
                    {deletingSlug === c.slug ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  </button>
                </div>
              </div>

              {/* Members accordion */}
              <AnimatePresence initial={false}>
                {openSlug === c.slug && (
                  <motion.div key="members" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: "hidden" }}>
                    <div className="border-t px-4 py-4 space-y-2" style={{ borderColor: "var(--glass-border)" }}>
                      {membersLoading ? (
                        <div className="flex justify-center py-4">
                          <Loader2 size={20} className="animate-spin" style={{ color: "var(--text-muted)" }} />
                        </div>
                      ) : members.length === 0 ? (
                        <p className="text-xs text-center py-4" style={{ color: "var(--text-muted)" }}>No members yet.</p>
                      ) : (
                        members.map((m) => (
                          <div key={m.id} className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-xl px-3 py-2.5" style={{ background: "var(--glass-bg-subtle)" }}>
                            {/* Avatar + name */}
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              {m.user.image ? (
                                <img src={m.user.image} alt={m.user.name ?? ""} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                              ) : (
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--scarlet), var(--purple))", color: "#fff" }}>
                                  {m.user.name?.[0] ?? "?"}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>{m.user.name ?? "Unknown"}</p>
                                {m.user.country && <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{m.user.country}</p>}
                              </div>
                            </div>
                            {/* Role + remove */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <select
                                value={m.role}
                                disabled={roleUpdating === m.id}
                                onChange={(e) => handleRoleChange(c.slug, m.id, e.target.value)}
                                className="text-xs rounded-lg px-2 py-1 font-semibold flex-1 sm:flex-none"
                                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--text-secondary)", outline: "none" }}
                              >
                                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                              </select>
                              <button onClick={() => handleRemoveMember(c.slug, m.id)} disabled={removingMember === m.id} className="p-1.5 rounded-lg transition-all hover:scale-110 disabled:opacity-50 flex-shrink-0" style={{ color: "var(--scarlet)" }}>
                                {removingMember === m.id ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
