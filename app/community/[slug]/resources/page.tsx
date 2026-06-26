"use client";

import { motion } from "framer-motion";
import { CommunityResources } from "@/components/community/CommunityContent";

export default function CommunityResourcesPage({
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
      <CommunityResources communitySlug={params.slug} />
    </motion.div>
  );
}
