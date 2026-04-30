"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface DeleteServiceCategoryButtonProps {
  id: string;
  name: string;
  serviceCount: number;
}

export default function DeleteServiceCategoryButton({
  id,
  name,
  serviceCount,
}: DeleteServiceCategoryButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (serviceCount > 0) {
      alert(
        `Cannot delete "${name}" because it has ${serviceCount} service(s). Please reassign or remove those services first.`,
      );
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete the category "${name}"? This cannot be undone.`,
      )
    ) {
      return;
    }

    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/service-categories/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete category");
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Failed to delete category");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 hover:bg-[var(--error-bg)] text-[var(--error-text)] rounded-lg transition-colors disabled:opacity-50"
      title={
        serviceCount > 0
          ? "Cannot delete category with services"
          : "Delete category"
      }
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
