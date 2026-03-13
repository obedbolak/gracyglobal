// app/api/jobs/[id]/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/api";

// ── GET /api/jobs/[id] ────────────────────────────────────────────────────────
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const job = await prisma.job.findUnique({
      where: { id: params.id },
      include: { _count: { select: { applications: true } } },
    });

    if (!job) return err("Job not found", 404);
    if (!job.active) return err("This job listing is no longer active", 410);

    return ok(job);
  } catch (e) {
    console.error("[GET /api/jobs/[id]]", e);
    return err("Internal server error", 500);
  }
}
