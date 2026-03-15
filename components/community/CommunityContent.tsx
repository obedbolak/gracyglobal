"use client";

// ─── Projects ─────────────────────────────────────────────────────────────────
import { useState } from "react";
import { motion } from "framer-motion";
import { Users, MapPin, Clock, Download, Search } from "lucide-react";
import {
  PROJECTS,
  EVENTS,
  RESOURCES,
  MEMBERS,
  SYSTEMS,
  type SystemId,
} from "@/data/community";
import SystemPills from "./SystemPills";

export function CommunityProjects() {
  const [activeSystem, setActiveSystem] = useState<SystemId | "all">("all");
  const filtered = PROJECTS.filter(
    (p) => activeSystem === "all" || p.system === activeSystem,
  );
  const system = (id: SystemId) => SYSTEMS.find((s) => s.id === id)!;
  const statusColor: Record<string, string> = {
    Active: "var(--success-text)",
    Recruiting: "var(--warning-text)",
    Completed: "var(--info-text)",
  };
  const statusBg: Record<string, string> = {
    Active: "var(--success-bg)",
    Recruiting: "var(--warning-bg)",
    Completed: "var(--info-bg)",
  };

  return (
    <div>
      <SystemPills active={activeSystem} onChangeAction={setActiveSystem} />
      <div className="grid sm:grid-cols-2 gap-4">
        {filtered.map((proj, i) => {
          const sys = system(proj.system);
          return (
            <motion.div
              key={proj.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.07 }}
              className="glass flex flex-col gap-4 p-5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: "var(--glass-bg-subtle)",
                    color: "var(--text-muted)",
                  }}
                >
                  {sys.icon} {sys.label}
                </span>
                <span
                  className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: statusBg[proj.status],
                    color: statusColor[proj.status],
                  }}
                >
                  {proj.status}
                </span>
              </div>
              <div>
                <h3
                  className="font-extrabold text-sm mb-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  {proj.title}
                </h3>
                <p
                  className="text-xs font-light leading-relaxed"
                  style={{ color: "var(--text-muted)" }}
                >
                  {proj.description}
                </p>
              </div>
              <div
                className="flex items-center gap-4 text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                <span className="flex items-center gap-1">
                  <Users size={11} /> {proj.members} members
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={11} /> {proj.country}
                </span>
              </div>
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-lg self-start"
                style={{
                  background: "var(--glass-bg-subtle)",
                  color: "var(--text-secondary)",
                }}
              >
                Goal: {proj.goal}
              </span>
              <div
                className="flex items-center justify-between pt-2"
                style={{ borderTop: "1px solid var(--divider)" }}
              >
                <div className="flex items-center gap-2">
                  <img
                    src={proj.lead.avatar}
                    alt={proj.lead.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Led by {proj.lead.name}
                  </span>
                </div>
                {proj.status === "Recruiting" && (
                  <button
                    className="text-xs font-bold px-3 py-1.5 rounded-lg text-white transition-all hover:scale-105"
                    style={{ background: sys.gradient }}
                  >
                    Join Project
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Events ───────────────────────────────────────────────────────────────────
export function CommunityEvents() {
  const [activeSystem, setActiveSystem] = useState<SystemId | "all">("all");
  const filtered = EVENTS.filter(
    (e) => activeSystem === "all" || e.system === activeSystem,
  );
  const system = (id: SystemId) => SYSTEMS.find((s) => s.id === id)!;
  const typeColor: Record<string, string> = {
    Online: "var(--badge-blue-bg)",
    "In-Person": "var(--badge-scarlet-bg)",
    Hybrid: "var(--badge-purple-bg)",
  };
  const typeText: Record<string, string> = {
    Online: "var(--blue-dark)",
    "In-Person": "var(--scarlet-dark)",
    Hybrid: "var(--purple-dark)",
  };

  return (
    <div>
      <SystemPills active={activeSystem} onChangeAction={setActiveSystem} />
      <div className="flex flex-col gap-4">
        {filtered.map((ev, i) => {
          const sys = system(ev.system);
          const pct = Math.round((ev.attendees / ev.capacity) * 100);
          return (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.07 }}
              className="glass p-5 flex flex-col sm:flex-row gap-5"
            >
              <div
                className="flex-shrink-0 w-16 h-16 rounded-2xl flex flex-col items-center justify-center text-white"
                style={{ background: sys.gradient }}
              >
                <span className="text-xs font-semibold opacity-80">
                  {new Date(ev.date)
                    .toLocaleDateString("en-GB", { month: "short" })
                    .toUpperCase()}
                </span>
                <span className="text-2xl font-extrabold leading-none">
                  {new Date(ev.date).getDate()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: "var(--glass-bg-subtle)",
                      color: "var(--text-muted)",
                    }}
                  >
                    {sys.icon} {sys.label}
                  </span>
                  <span
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: typeColor[ev.type],
                      color: typeText[ev.type],
                    }}
                  >
                    {ev.type}
                  </span>
                </div>
                <h3
                  className="font-extrabold text-sm mb-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  {ev.title}
                </h3>
                <p
                  className="text-xs font-light mb-3 line-clamp-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  {ev.description}
                </p>
                <div
                  className="flex flex-wrap gap-4 text-xs mb-3"
                  style={{ color: "var(--text-muted)" }}
                >
                  <span className="flex items-center gap-1">
                    <Clock size={11} /> {ev.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={11} /> {ev.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={11} /> {ev.attendees}/{ev.capacity}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="flex-1 h-1.5 rounded-full overflow-hidden"
                    style={{ background: "var(--glass-bg-subtle)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: sys.gradient }}
                    />
                  </div>
                  <span
                    className="text-[10px] font-semibold flex-shrink-0"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {pct}% full
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0 flex flex-col justify-center">
                <button
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-105"
                  style={{
                    background: sys.gradient,
                    boxShadow: `0 4px 12px ${sys.glow}`,
                  }}
                >
                  RSVP
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Resources ────────────────────────────────────────────────────────────────
export function CommunityResources() {
  const [activeSystem, setActiveSystem] = useState<SystemId | "all">("all");
  const filtered = RESOURCES.filter(
    (r) => activeSystem === "all" || r.system === activeSystem,
  );
  const system = (id: SystemId) => SYSTEMS.find((s) => s.id === id)!;
  const typeIcon: Record<string, string> = {
    PDF: "📄",
    Video: "🎬",
    Template: "🎨",
    Toolkit: "🧰",
    Report: "📊",
  };

  return (
    <div>
      <SystemPills active={activeSystem} onChangeAction={setActiveSystem} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((res, i) => {
          const sys = system(res.system);
          return (
            <motion.div
              key={res.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              className="glass flex flex-col gap-3 p-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{typeIcon[res.type]}</span>
                <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: "var(--glass-bg-subtle)",
                    color: "var(--text-muted)",
                  }}
                >
                  {sys.icon} {sys.label}
                </span>
              </div>
              <div>
                <h3
                  className="font-bold text-sm mb-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  {res.title}
                </h3>
                <p
                  className="text-xs font-light leading-relaxed line-clamp-3"
                  style={{ color: "var(--text-muted)" }}
                >
                  {res.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-1 mt-auto">
                {res.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] px-1.5 py-0.5 rounded"
                    style={{
                      background: "var(--badge-neutral-bg)",
                      color: "var(--text-muted)",
                    }}
                  >
                    #{t}
                  </span>
                ))}
              </div>
              <div
                className="flex items-center justify-between pt-3"
                style={{ borderTop: "1px solid var(--divider)" }}
              >
                <span
                  className="flex items-center gap-1 text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  <Download size={11} /> {res.downloads.toLocaleString()}
                </span>
                <button
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-white transition-all hover:scale-105"
                  style={{ background: sys.gradient }}
                >
                  <Download size={11} /> Get
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Members ─────────────────────────────────────────────────────────────────
export function CommunityMembers() {
  const [search, setSearch] = useState("");
  const filtered = MEMBERS.filter(
    (m) =>
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase()),
  );
  const badgeStyle: Record<string, { bg: string; text: string }> = {
    Pioneer: {
      bg: "linear-gradient(135deg, var(--scarlet), var(--purple))",
      text: "#fff",
    },
    Mentor: {
      bg: "linear-gradient(135deg, var(--purple), var(--blue))",
      text: "#fff",
    },
    Leader: {
      bg: "linear-gradient(135deg, var(--blue), #10b981)",
      text: "#fff",
    },
    Contributor: {
      bg: "var(--badge-neutral-bg)",
      text: "var(--text-secondary)",
    },
  };

  return (
    <div>
      <div className="relative mb-6">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "var(--text-disabled)" }}
        />
        <input
          type="text"
          placeholder="Search members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
            color: "var(--text-primary)",
            outline: "none",
          }}
        />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((member, i) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.06 }}
            className="glass flex flex-col gap-4 p-5"
          >
            <div className="flex items-start gap-3">
              <div className="relative flex-shrink-0">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-12 h-12 rounded-2xl object-cover"
                />
                <span className="absolute -bottom-1 -right-1 text-sm">
                  {member.country.split(" ")[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span
                    className="font-bold text-sm truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {member.name}
                  </span>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: badgeStyle[member.badge].bg,
                      color: badgeStyle[member.badge].text,
                    }}
                  >
                    {member.badge}
                  </span>
                </div>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {member.role} · {member.country}
                </p>
              </div>
            </div>
            <p
              className="text-xs font-light leading-relaxed line-clamp-2"
              style={{ color: "var(--text-secondary)" }}
            >
              {member.bio}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {member.systems.map((sid) => {
                const sys = SYSTEMS.find((s) => s.id === sid)!;
                return (
                  <span
                    key={sid}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{
                      background: "var(--glass-bg-subtle)",
                      border: "1px solid var(--glass-border)",
                      color: "var(--text-muted)",
                    }}
                  >
                    {sys.icon} {sys.label}
                  </span>
                );
              })}
            </div>
            <div
              className="flex items-center justify-between pt-2"
              style={{ borderTop: "1px solid var(--divider)" }}
            >
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {member.contributions} contributions
              </span>
              <button
                className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:scale-105"
                style={{
                  background: "var(--glass-bg)",
                  border: "1px solid var(--glass-border)",
                  color: "var(--text-secondary)",
                }}
              >
                View Profile
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
