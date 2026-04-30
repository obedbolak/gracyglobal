import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CourseCategoryForm from "../../_components/CourseCategoryForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditCourseCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const category = await prisma.courseCategory.findUnique({
    where: { id },
  });

  if (!category) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/courses/categories"
          className="p-2 hover:bg-[var(--glass-bg-hover)] rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--text-primary)]" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Edit Course Category
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Update {category.name}
          </p>
        </div>
      </div>

      <CourseCategoryForm category={category} />
    </div>
  );
}
