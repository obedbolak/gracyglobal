"use client";

import { use } from "react";
import { motion } from "framer-motion";
import CommunityFeed from "@/components/community/CommunityFeed";

export default function CommunityFeedPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className="flex-1 min-h-0 pr-1 pt-6"
    >
      <CommunityFeed communitySlug={slug} />
    </motion.div>
  );
}
