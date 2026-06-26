"use client";

import { use } from "react";
import { motion } from "framer-motion";
import { CommunityEvents } from "@/components/community/CommunityContent";

export default function CommunityEventsPage({
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
      className="flex-1 min-h-0"
    >
      <CommunityEvents communitySlug={slug} />
    </motion.div>
  );
}
