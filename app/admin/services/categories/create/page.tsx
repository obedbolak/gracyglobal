import ServiceCategoryForm from "../_components/ServiceCategoryForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CreateServiceCategoryPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/services/categories"
          className="p-2 hover:bg-[var(--glass-bg-hover)] rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--text-primary)]" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Create Service Category
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Add a new category for service listings.
          </p>
        </div>
      </div>

      <ServiceCategoryForm />
    </div>
  );
}
