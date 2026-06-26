"use client";

import { motion } from "framer-motion";
import { CommunityMembers } from "@/components/community/CommunityContent";

export default function CommunityMembersPage({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className="flex-1 min-h-0"
    >
      <CommunityMembers communitySlug={params.slug} />
    </motion.div>
  );
}
