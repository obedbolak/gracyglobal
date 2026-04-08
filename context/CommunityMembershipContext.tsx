"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { useMyCommunities } from "@/hooks/useCommunity";
import { useSession } from "next-auth/react";

interface Membership {
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

interface CommunityMembershipContextValue {
  memberships: Membership[];
  loading: boolean;
  isMember: (slug: string) => boolean;
  isAnyMember: boolean;
  selectedSlug: string | null;
  setSelectedSlug: (slug: string) => void;
  selectedCommunity: Membership["community"] | null;
  refresh: () => void;
}

const CommunityMembershipContext =
  createContext<CommunityMembershipContextValue | null>(null);

export function CommunityMembershipProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { data: session } = useSession();
  const { communities: raw, loading, mutate } = useMyCommunities();

  // useMyCommunities returns Community[] but /api/communities/my returns Membership[]
  // cast properly
  const memberships = raw as unknown as Membership[];

  const isAnyMember = !!session && memberships.length > 0;

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  // Auto-select first community once loaded
  const resolvedSlug = selectedSlug ?? memberships[0]?.community.slug ?? null;

  const selectedCommunity =
    memberships.find((m) => m.community.slug === resolvedSlug)?.community ??
    null;

  function isMember(slug: string) {
    return memberships.some((m) => m.community.slug === slug);
  }

  return (
    <CommunityMembershipContext.Provider
      value={{
        memberships,
        loading,
        isMember,
        isAnyMember,
        selectedSlug: resolvedSlug,
        setSelectedSlug,
        selectedCommunity,
        refresh: mutate,
      }}
    >
      {children}
    </CommunityMembershipContext.Provider>
  );
}

export function useCommunityMembership() {
  const ctx = useContext(CommunityMembershipContext);
  if (!ctx)
    throw new Error(
      "useCommunityMembership must be used inside CommunityMembershipProvider",
    );
  return ctx;
}
