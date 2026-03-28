// app/admin/counselors/[id]/edit/page.tsx

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditCounselorForm from "@/components/admin/EditCounselorForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCounselorPage({ params }: PageProps) {
  const { id } = await params;

  const counselor = await prisma.counselor.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          phone: true,
          country: true,
        },
      },
    },
  });

  if (!counselor) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/counselors"
          className="p-2 hover:bg-[var(--glass-bg-hover)] rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Edit Counselor
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Update counselor profile and settings
          </p>
        </div>
      </div>

      <EditCounselorForm counselor={counselor} />
    </div>
  );
}
