// app/admin/counselors/_components/CounselorActions.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";

interface CounselorActionsProps {
  counselorId: string;
  counselorName: string;
}

export function CounselorActions({
  counselorId,
  counselorName,
}: CounselorActionsProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete ${counselorName}? This will also remove all their bookings.`,
      )
    ) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/counselors/${counselorId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete counselor");
      }

      router.refresh();
    } catch (error: any) {
      alert(error.message);
      setDeleting(false);
    }
  };

  return (
    <div className="flex gap-2 pt-3">
      <Link
        href={`/counselors/${counselorId}`}
        className="flex-1 btn-secondary flex items-center justify-center gap-2 py-2 rounded-lg text-sm"
      >
        <Eye className="w-4 h-4" />
        View
      </Link>
      <Link
        href={`/admin/counselors/${counselorId}/edit`}
        className="flex-1 btn-primary flex items-center justify-center gap-2 py-2 rounded-lg text-sm"
      >
        <Edit className="w-4 h-4" />
        Edit
      </Link>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="p-2 hover:bg-[var(--error-bg)] text-[var(--error-text)] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
