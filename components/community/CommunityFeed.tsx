"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, ThumbsUp, MessageCircle } from "lucide-react";
import { POSTS, SYSTEMS, type SystemId } from "@/data/community";
import SystemPills from "./SystemPills";

export default function CommunityFeed() {
  const [activeSystem, setActiveSystem] = useState<SystemId | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = POSTS
    .filter((p) => activeSystem === "all" || p.system === activeSystem)
    .filter((p) => !search || p.title.toLowerCase().includes(search.toLowerCase()));

  const system = (id: SystemId) => SYSTEMS.find((s) => s.id === id)!;

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--text-disabled)" }} />
          <input type="text" placeholder="Search discussions..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl"
            style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--text-primary)", outline: "none" }} />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg, var(--purple), var(--blue))" }}>
          + New Post
        </button>
      </div>

      <SystemPills active={activeSystem} onChangeAction={setActiveSystem} />

      <div className="flex flex-col gap-4">
        {filtered.map((post, i) => {
          const sys = system(post.system);
          return (
            <motion.div key={post.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              className="glass p-5 group cursor-pointer transition-all duration-200 hover:scale-[1.005]">
              <div className="flex items-start gap-4">
                <img src={post.author.avatar} alt={post.author.name}
                  className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    {post.pinned && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ background: sys.gradient }}>📌 Pinned</span>
                    )}
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: "var(--glass-bg-subtle)", color: "var(--text-muted)" }}>
                      {sys.icon} {sys.label}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm mb-1 group-hover:opacity-80 transition-opacity"
                    style={{ color: "var(--text-primary)" }}>{post.title}</h3>
                  <p className="text-xs font-light leading-relaxed mb-3 line-clamp-2"
                    style={{ color: "var(--text-muted)" }}>{post.excerpt}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs" style={{ color: "var(--text-muted)" }}>
                    <span className="font-medium" style={{ color: "var(--text-secondary)" }}>{post.author.name}</span>
                    <span>{post.author.country}</span>
                    <span className="flex items-center gap-1"><ThumbsUp size={11} /> {post.likes}</span>
                    <span className="flex items-center gap-1"><MessageCircle size={11} /> {post.replies}</span>
                    <div className="flex gap-1 ml-auto flex-wrap">
                      {post.tags.map((t) => (
                        <span key={t} className="px-1.5 py-0.5 rounded text-[10px]"
                          style={{ background: "var(--badge-neutral-bg)", color: "var(--text-muted)" }}>#{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <div className="glass py-16 text-center">
            <p className="text-sm font-light" style={{ color: "var(--text-muted)" }}>No discussions found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
