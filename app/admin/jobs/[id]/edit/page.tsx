// app/admin/jobs/[id]/edit/page.tsx

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditJobForm from "@/components/admin/EditJobForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditJobPage({ params }: PageProps) {
  const { id } = await params;

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      jobCategory: true,
    },
  });

  if (!job) {
    notFound();
  }

  return <EditJobForm job={job} />;
}
