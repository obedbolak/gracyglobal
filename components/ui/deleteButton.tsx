"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeleteProductButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to delete");
      router.refresh(); // re-run the server component to update the table
    } catch (err: any) {
      alert(err.message ?? "Failed to delete product");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      title={`Delete ${name}`}
      className="p-2 hover:bg-[var(--error-bg)] text-[var(--error-text)] rounded-lg transition-colors disabled:opacity-40"
    >
      <Trash2 className={`w-4 h-4 ${loading ? "animate-pulse" : ""}`} />
    </button>
  );
}
