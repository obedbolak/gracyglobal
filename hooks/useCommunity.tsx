"use client";

import useSWR, { mutate as globalMutate } from "swr";
import { useState } from "react";

// ─── Types matching real API responses ───────────────────────────────────────

/** Returned by GET /api/communities */
export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  category: string;
  memberCount: number;
  postCount: number;
  isJoined: boolean;
}

/** Returned by GET /api/communities/[slug]/posts (array items) */
export interface CommunityPost {
  id: string;
  userId: string;
  communityId: string;
  title: string | null;
  content: string | null;
  category: string | null;
  type: "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT" | "LINK";
  mediaUrl: string | null;
  mediaType: string | null;
  linkUrl: string | null;
  linkPreview: Record<string, string> | null;
  tags: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  _count: {
    comments: number;
    reactions: number;
  };
  reactions?: Array<{ type: string }>;
}

/** Returned by GET /api/communities/[slug]/members */
export interface CommunityMemberRecord {
  id: string;
  userId: string;
  role: "MEMBER" | "MODERATOR" | "ADMIN";
  joinedAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    country: string | null;
  };
}

/** Returned by GET /api/communities/[slug]/events */
export interface CommunityEvent {
  id: string;
  communityId: string;
  title: string;
  description: string | null;
  scheduledAt: string;
  duration: number;
  meetingUrl: string | null;
  status: "SCHEDULED" | "LIVE" | "ENDED" | "CANCELLED";
  createdAt: string;
}

/** Returned by GET /api/communities/[slug]/resources */
export interface CommunityResource {
  id: string;
  communityId: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileType: string;
  downloads: number;
  tags: string[];
  createdAt: string;
}

/** Returned by GET /api/posts/[id]/comments */
export interface PostComment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export interface CommunityStats {
  members: number;
  posts: number;
  countries: number;
  communities: number;
}

// ─── Fetcher ─────────────────────────────────────────────────────────────────

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

// ─── 1. All Communities ──────────────────────────────────────────────────────

export interface UseCommunityListOptions {
  category?: string;
  search?: string;
}

export function useCommunities(options: UseCommunityListOptions = {}) {
  const params = new URLSearchParams();
  if (options.category) params.append("category", options.category);
  if (options.search) params.append("search", options.search);

  const key = `/api/communities?${params.toString()}`;

  // API returns a flat Community[] array
  const { data, error, isLoading, mutate } = useSWR<Community[]>(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30_000,
  });

  return {
    communities: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    mutate,
  };
}

// ─── 2. Community Feed ───────────────────────────────────────────────────────

export interface UseCommunityFeedOptions {
  slug: string;
  type?: string;
  limit?: number;
}

export function useCommunityFeed(options: UseCommunityFeedOptions) {
  const { slug, type, limit = 20 } = options;
  const params = new URLSearchParams();
  if (type) params.append("type", type);
  params.append("limit", String(limit));

  const key = slug
    ? `/api/communities/${slug}/posts?${params.toString()}`
    : null;

  // API returns a flat CommunityPost[] array
  const { data, error, isLoading, mutate } = useSWR<CommunityPost[]>(
    key,
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 5_000,
      refreshInterval: 8_000,
      refreshWhenHidden: false,
      refreshWhenOffline: false,
    },
  );

  return {
    posts: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    mutate,
  };
}

// ─── 3. Community Members ────────────────────────────────────────────────────

export function useCommunityMembers(slug: string, search?: string) {
  const params = new URLSearchParams();
  if (search) params.append("search", search);

  const key = slug
    ? `/api/communities/${slug}/members?${params.toString()}`
    : null;

  const { data, error, isLoading, mutate } = useSWR<CommunityMemberRecord[]>(
    key,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30_000 },
  );

  return {
    members: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    mutate,
  };
}

// ─── 4. Community Events ─────────────────────────────────────────────────────

export function useCommunityEvents(slug: string) {
  const key = slug ? `/api/communities/${slug}/events` : null;

  const { data, error, isLoading, mutate } = useSWR<CommunityEvent[]>(
    key,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30_000 },
  );

  return {
    events: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    mutate,
  };
}

// ─── 5. Community Resources ──────────────────────────────────────────────────

export function useCommunityResources(slug: string) {
  const key = slug ? `/api/communities/${slug}/resources` : null;

  const { data, error, isLoading, mutate } = useSWR<CommunityResource[]>(
    key,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30_000 },
  );

  return {
    resources: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    mutate,
  };
}

// ─── 6. My Communities ───────────────────────────────────────────────────────

export const MY_COMMUNITIES_KEY = "/api/communities/my";

export function useMyCommunities() {
  const { data, error, isLoading, mutate } = useSWR<Community[]>(
    MY_COMMUNITIES_KEY,
    fetcher,
    { revalidateOnFocus: true, dedupingInterval: 10_000 },
  );

  return {
    communities: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    mutate,
  };
}

// ─── 7. Community Stats ──────────────────────────────────────────────────────

export function useCommunityStats() {
  const { data, error, isLoading } = useSWR<CommunityStats>(
    "/api/community/stats",
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60_000 },
  );

  return {
    stats: data ?? { members: 0, posts: 0, countries: 0, communities: 0 },
    loading: isLoading,
    error: error?.message ?? null,
  };
}

// ─── 8. Post Comments ────────────────────────────────────────────────────────

export function usePostComments(postId: string) {
  const { data, error, isLoading, mutate } = useSWR<PostComment[]>(
    postId ? `/api/posts/${postId}/comments` : null,
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 5_000,
      refreshInterval: 10_000,
      refreshWhenHidden: false,
      refreshWhenOffline: false,
    },
  );

  return {
    comments: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    mutate,
  };
}

// ─── 9. Join / Leave Community ───────────────────────────────────────────────

export function useJoinCommunity() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle(slug: string): Promise<{ joined: boolean } | null> {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/communities/${slug}/join`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update membership");

      await Promise.all([
        globalMutate(
          (key: string) =>
            typeof key === "string" && key.startsWith("/api/communities"),
        ),
        globalMutate("/api/community/stats"),
        globalMutate(MY_COMMUNITIES_KEY),
      ]);

      return { joined: data.joined };
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { toggle, loading, error };
}

// ─── 10. Create Post ─────────────────────────────────────────────────────────

export interface CreatePostPayload {
  communityId: string;
  title?: string;
  content?: string;
  category?: string;
  type?: "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT" | "LINK";
  mediaUrl?: string;
  mediaType?: string;
  linkUrl?: string;
  tags?: string[];
}

export function useCreatePost() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createPost(
    slug: string,
    payload: CreatePostPayload,
  ): Promise<CommunityPost | null> {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/communities/${slug}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create post");
      await globalMutate(`/api/communities/${slug}/posts`);
      return data as CommunityPost;
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { createPost, loading, error };
}

// ─── 11. React to Post ───────────────────────────────────────────────────────

export type ReactionType = "LIKE" | "LOVE" | "SUPPORT";

export function useReactToPost() {
  const [loading, setLoading] = useState(false);

  async function react(
    postId: string,
    type: ReactionType,
    communitySlug: string,
  ): Promise<boolean> {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      if (!res.ok) return false;
      await globalMutate(`/api/communities/${communitySlug}/posts`);
      return true;
    } finally {
      setLoading(false);
    }
  }

  return { react, loading };
}

// ─── 12. Add Comment ─────────────────────────────────────────────────────────

export function useAddComment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addComment(
    postId: string,
    content: string,
  ): Promise<PostComment | null> {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/posts/${postId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add comment");
      await globalMutate(`/api/posts/${postId}/comments`);
      return data.comment as PostComment;
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { addComment, loading, error };
}
