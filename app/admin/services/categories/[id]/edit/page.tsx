// app/admin/services/categories/[id]/edit/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ServiceCategoryForm from "../../_components/ServiceCategoryForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditServiceCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const category = await prisma.serviceCategory.findUnique({
    where: { id },
  });

  if (!category) {
    notFound();
  }

  return (
    <div className="max-w-1xl mx-auto space-y-6 px-0 sm:px-0">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/services/categories"
          className="p-2 hover:bg-[var(--glass-bg-hover)] rounded-lg transition-colors shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--text-primary)]" />
        </Link>
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] truncate">
            Edit Service Category
          </h1>
          <p className="text-[var(--text-muted)] mt-1 truncate">
            Update {category.name}
          </p>
        </div>
      </div>

      <ServiceCategoryForm category={category} />
    </div>
  );
}
