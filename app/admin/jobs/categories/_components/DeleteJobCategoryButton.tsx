"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface DeleteJobCategoryButtonProps {
  id: string;
  name: string;
  jobCount: number;
}

export default function DeleteJobCategoryButton({
  id,
  name,
  jobCount,
}: DeleteJobCategoryButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (jobCount > 0) {
      alert(
        `Cannot delete "${name}" because it has ${jobCount} job(s). Please reassign or remove those jobs first.`,
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
      const res = await fetch(`/api/jobs/job-categories/${id}`, {
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
        jobCount > 0 ? "Cannot delete category with jobs" : "Delete category"
      }
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
