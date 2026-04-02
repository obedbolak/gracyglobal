"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import EarningsChart from "@/components/counselor/EarningsChart";
import { Loader2 } from "lucide-react";

export default function CounselorEarningsPage() {
  const { status } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") fetchEarnings();
  }, [status]);

  const fetchEarnings = async () => {
    try {
      const meRes = await fetch("/api/counselors?me=true");
      const meJson = await meRes.json();
      if (!meJson.success) throw new Error("Failed to get profile");

      const counselorId = meJson.data.id;

      const res = await fetch(
        `/api/counselors/${counselorId}?include=earnings`,
      );
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (err) {
      console.error("Failed to load earnings:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2
          className="w-8 h-8 animate-spin"
          style={{ color: "var(--purple)" }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-3xl font-extrabold"
          style={{ color: "var(--text-primary)" }}
        >
          Earnings
        </h1>
        <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
          Track your income from counseling sessions.
        </p>
      </div>

      <EarningsChart
        totalEarnings={data?.totalEarnings ?? 0}
        monthlyEarnings={data?.monthlyEarnings ?? 0}
        pendingPayouts={data?.pendingPayouts ?? 0}
        completedPayouts={data?.completedPayouts ?? 0}
        recentPayments={data?.recentPayments ?? []}
      />
    </div>
  );
}
