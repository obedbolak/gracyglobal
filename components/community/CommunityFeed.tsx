"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, ThumbsUp, MessageCircle, Heart } from "lucide-react";
import { SYSTEMS, type SystemId } from "@/data/community";
import Link from "next/link";

interface PostData {
  id: string;
  title: string;
  content: string;
  type: string;
  tags: string[];
  user: { id: string; name: string; image: string };
  _count: { comments: number; reactions: number };
  reactions?: Array<{ type: string }>;
  createdAt: string;
}

interface CommunityData {
  id: string;
  name: string;
  slug: string;
}

export default function CommunityFeed({
  selectedSystem = "all",
  communitySlug,
}: {
  selectedSystem?: SystemId | "all";
  communitySlug?: string;
}) {
  const [search, setSearch] = useState("");
  const [posts, setPosts] = useState<PostData[]>([]);
  const [community, setCommunity] = useState<CommunityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const slug = communitySlug || selectedSystem;

        if (slug === "all" || !slug) {
          // Fetch all communities and their posts
          const response = await fetch(`/api/communities`);
          const communities = await response.json();
          // For now, just show a message
          setPosts([]);
        } else {
          // Fetch posts from specific community
          const response = await fetch(`/api/communities/${slug}/posts`);
          if (response.ok) {
            const data = await response.json();
            setPosts(data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [selectedSystem, communitySlug]);

  const filtered = posts.filter(
    (p) =>
      !search ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.content?.toLowerCase().includes(search.toLowerCase()),
  );

  const system = (id: SystemId) => SYSTEMS.find((s) => s.id === id)!;

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--text-disabled)" }}
          />
          <input
            type="text"
            placeholder="Search discussions..."
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
        <Link
          href={
            communitySlug
              ? `/community/${communitySlug}/new-post`
              : "/community"
          }
        >
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-105"
            style={{
              background: "linear-gradient(135deg, var(--purple), var(--blue))",
            }}
          >
            + New Post
          </button>
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="glass py-16 text-center">
            <p style={{ color: "var(--text-muted)" }}>Loading posts...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass py-16 text-center">
            <p
              className="text-sm font-light"
              style={{ color: "var(--text-muted)" }}
            >
              No posts yet. Be the first to share!
            </p>
          </div>
        ) : (
          filtered.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              className="glass p-5 group cursor-pointer transition-all duration-200 hover:scale-[1.005]"
            >
              <Link href={`/community/${communitySlug || "posts"}/${post.id}`}>
                <a className="block">
                  <div className="flex items-start gap-4">
                    <img
                      src={post.user.image || "https://via.placeholder.com/40"}
                      alt={post.user.name}
                      className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                          style={{
                            background: "var(--glass-bg-subtle)",
                            color: "var(--text-muted)",
                          }}
                        >
                          {post.type}
                        </span>
                      </div>
                      <h3
                        className="font-bold text-sm mb-1 group-hover:opacity-80 transition-opacity"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {post.title}
                      </h3>
                      <p
                        className="text-xs font-light leading-relaxed mb-3 line-clamp-2"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {post.content}
                      </p>
                      <div
                        className="flex flex-wrap items-center gap-4 text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <span
                          className="font-medium"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {post.user.name}
                        </span>
                        <span>
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart size={11} /> {post._count.reactions}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle size={11} /> {post._count.comments}
                        </span>
                        <div className="flex gap-1 ml-auto flex-wrap">
                          {post.tags.map((t) => (
                            <span
                              key={t}
                              className="px-1.5 py-0.5 rounded text-[10px]"
                              style={{
                                background: "var(--badge-neutral-bg)",
                                color: "var(--text-muted)",
                              }}
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
              </Link>
            </motion.div>
          ))
        )}
        {filtered.length === 0 && (
          <div className="glass py-16 text-center">
            <p
              className="text-sm font-light"
              style={{ color: "var(--text-muted)" }}
            >
              No discussions found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
