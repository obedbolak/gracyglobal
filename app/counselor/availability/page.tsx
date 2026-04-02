"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import AvailabilityCalendar from "@/components/counselor/AvailabilityCalendar";

export default function AvailabilityPage() {
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (slots: { day: string; times: string[] }[]) => {
    setSaving(true);
    try {
      // TODO: Save availability to API
      await new Promise((r) => setTimeout(r, 1000));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-3xl font-extrabold"
          style={{ color: "var(--text-primary)" }}
        >
          Availability
        </h1>
        <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
          Set your weekly schedule so clients know when to book.
        </p>
      </div>

      {saved && (
        <div
          className="p-4 rounded-xl text-sm font-medium"
          style={{
            background: "var(--success-bg)",
            color: "var(--success-text)",
            border: "1px solid var(--success-border)",
          }}
        >
          ✅ Availability saved successfully!
        </div>
      )}

      <AvailabilityCalendar onSave={handleSave} saving={saving} />
    </div>
  );
}
