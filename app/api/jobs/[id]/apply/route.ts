// app/api/jobs/[id]/apply/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireUser } from "@/lib/api";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await requireUser();
    if (!user) return err("Unauthorized", 401);

    const body = await req.json().catch(() => ({}));
    const { coverNote } = body;

    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) return err("Job not found", 404);
    if (!job.active) return err("This job listing is no longer active", 410);
    if (job.expiresAt && job.expiresAt < new Date()) {
      return err("This job listing has expired", 410);
    }

    const existing = await prisma.jobApplication.findUnique({
      where: { userId_jobId: { userId: user.id, jobId: id } },
    });
    if (existing) return err("You have already applied for this job", 409);

    const application = await prisma.jobApplication.create({
      data: {
        userId: user.id,
        jobId: id,
        coverNote: coverNote ?? null,
        status: "APPLIED",
      },
      include: { job: { select: { title: true, company: true } } },
    });

    return ok(application, 201);
  } catch (e) {
    console.error("[POST /api/jobs/[id]/apply]", e);
    return err("Internal server error", 500);
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await requireUser();
    if (!user) return err("Unauthorized", 401);

    const application = await prisma.jobApplication.findUnique({
      where: { userId_jobId: { userId: user.id, jobId: id } },
    });

    return ok({ applied: !!application, application: application ?? null });
  } catch (e) {
    console.error("[GET /api/jobs/[id]/apply]", e);
    return err("Internal server error", 500);
  }
}
