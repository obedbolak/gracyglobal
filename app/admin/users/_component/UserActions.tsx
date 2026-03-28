// app/admin/users/_components/UserActions.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";

interface UserActionsProps {
  userId: string;
  userName: string;
}

export function UserActions({ userId, userName }: UserActionsProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete "${userName}"? This cannot be undone.`,
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete user");
      }

      router.refresh();
    } catch (error: any) {
      alert(error.message);
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        href={`/admin/users/${userId}`}
        className="p-2 hover:bg-[var(--purple-faint)] text-[var(--purple)] rounded-lg transition-colors"
        title="View Details"
      >
        <Eye className="w-4 h-4" />
      </Link>
      <Link
        href={`/admin/users/${userId}/edit`}
        className="p-2 hover:bg-[var(--blue-faint)] text-[var(--blue)] rounded-lg transition-colors"
        title="Edit User"
      >
        <Edit className="w-4 h-4" />
      </Link>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="p-2 hover:bg-[var(--scarlet-faint)] text-[var(--scarlet)] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Delete User"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
