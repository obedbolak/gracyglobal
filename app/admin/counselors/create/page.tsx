// app/admin/counselors/create/page.tsx

import CreateCounselorForm from "@/components/admin/CreateCounselorForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateCounselorPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/counselors"
          className="p-2 hover:bg-[var(--glass-bg-hover)] rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Add Counselor
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Create a new counselor profile
          </p>
        </div>
      </div>

      <CreateCounselorForm />
    </div>
  );
}
