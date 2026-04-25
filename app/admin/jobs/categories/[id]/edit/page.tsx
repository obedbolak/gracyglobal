// app/admin/jobs/categories/[id]/edit/page.tsx

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import JobCategoryForm from "../../_components/JobCategoryForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditJobCategoryPage({ params }: PageProps) {
  const { id } = await params;

  const category = await prisma.jobCategoryModel.findUnique({
    where: { id },
  });

  if (!category) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/jobs/categories"
          className="p-2 hover:bg-[var(--glass-bg-hover)] rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--text-primary)]" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Edit Job Category
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Update {category.name}
          </p>
        </div>
      </div>

      <JobCategoryForm category={category} />
    </div>
  );
}
