"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteCategoryButton({
  id,
  name,
  productCount,
}: {
  id: string;
  name: string;
  productCount: number;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (productCount > 0) {
      alert(
        `Cannot delete "${name}" because it has ${productCount} product(s). Please reassign or delete those products first.`,
      );
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete the category "${name}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete category");
      }

      router.refresh();
    } catch (error: any) {
      alert(error.message || "Failed to delete category");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 hover:bg-[var(--error-bg)] text-[var(--error-text)] rounded-lg transition-colors disabled:opacity-50"
      title={
        productCount > 0
          ? "Cannot delete category with products"
          : "Delete category"
      }
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
