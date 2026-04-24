import CategoryForm from "../_components/CategoryForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CreateCategoryPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/categories"
          className="p-2 hover:bg-[var(--glass-bg-hover)] rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--text-primary)]" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Create Category
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Add a new product category
          </p>
        </div>
      </div>

      <CategoryForm />
    </div>
  );
}
