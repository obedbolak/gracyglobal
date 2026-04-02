"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  DollarSign,
  TrendingUp,
  Copy,
  Check,
  Loader2,
  ExternalLink,
  Share2,
  AlertCircle,
} from "lucide-react";

interface AffiliateData {
  id: string;
  code: string;
  tier: string;
  totalReferrals: number;
  totalEarnings: number;
  pendingPayout: number;
  commissionRate: number;
  referrals: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    status: string;
  }[];
}

export default function AffiliateDashboardPage() {
  const [affiliate, setAffiliate] = useState<AffiliateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAffiliateData();
  }, []);

  const fetchAffiliateData = async () => {
    try {
      const res = await fetch("/api/affiliates");
      if (!res.ok) {
        if (res.status === 404) {
          setAffiliate(null);
          return;
        }
        throw new Error("Failed to fetch");
      }
      const data = await res.json();
      if (data.success) {
        setAffiliate(data.data);
      } else {
        setError(data.error || "Failed to load affiliate data");
      }
    } catch (err) {
      console.error("Failed to fetch affiliate data:", err);
      setError("Failed to load affiliate data");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const affiliateLink = affiliate
    ? `${window.location.origin}?ref=${affiliate.code}`
    : "";

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Affiliate Program
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Track your referrals and earnings
          </p>
        </div>
        <div
          className="text-center py-16 rounded-2xl"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <AlertCircle
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: "var(--scarlet)" }}
          />
          <h3
            className="text-xl font-semibold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Failed to load affiliate data
          </h3>
          <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
            {error}
          </p>
          <button
            onClick={fetchAffiliateData}
            className="px-6 py-3 rounded-lg text-white font-semibold"
            style={{
              background: "linear-gradient(135deg, var(--purple), var(--blue))",
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2
            className="w-8 h-8 animate-spin mx-auto mb-4"
            style={{ color: "var(--blue)" }}
          />
          <p style={{ color: "var(--text-secondary)" }}>
            Loading affiliate data...
          </p>
        </div>
      </div>
    );
  }

  if (!affiliate) {
    return (
      <div className="space-y-8">
        <div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Affiliate Program
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Earn commissions by promoting Gracyglobal
          </p>
        </div>

        <div
          className="p-8 rounded-2xl"
          style={{
            background: "linear-gradient(135deg, var(--purple), var(--blue))",
          }}
        >
          <div className="text-center text-white">
            <Share2 className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">
              Become an Affiliate Partner
            </h2>
            <p className="text-lg mb-6 max-w-2xl mx-auto opacity-90">
              Join our affiliate program and earn up to 30% commission on every
              referral. Help build a stronger Africa — one click at a time.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            className="p-6 rounded-2xl text-center"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
            }}
          >
            <div
              className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ background: "var(--info-bg)" }}
            >
              <Users className="w-6 h-6" style={{ color: "var(--blue)" }} />
            </div>
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Share Your Link
            </h3>
            <p style={{ color: "var(--text-secondary)" }}>
              Get a unique referral link to share with your network
            </p>
          </div>

          <div
            className="p-6 rounded-2xl text-center"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
            }}
          >
            <div
              className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ background: "var(--success-bg)" }}
            >
              <TrendingUp
                className="w-6 h-6"
                style={{ color: "var(--green)" }}
              />
            </div>
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Earn Commissions
            </h3>
            <p style={{ color: "var(--text-secondary)" }}>
              Earn up to 30% commission on every successful referral
            </p>
          </div>

          <div
            className="p-6 rounded-2xl text-center"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
            }}
          >
            <div
              className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ background: "var(--warning-bg)" }}
            >
              <DollarSign
                className="w-6 h-6"
                style={{ color: "var(--yellow)" }}
              />
            </div>
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Get Paid
            </h3>
            <p style={{ color: "var(--text-secondary)" }}>
              Receive monthly payouts directly to your account
            </p>
          </div>
        </div>

        <div
          className="p-8 rounded-2xl"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <h3
            className="text-2xl font-bold mb-6 text-center"
            style={{ color: "var(--text-primary)" }}
          >
            Commission Tiers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              className="p-6 rounded-xl text-center"
              style={{
                background: "var(--glass-bg-subtle)",
                border: "1px solid var(--divider)",
              }}
            >
              <div
                className="text-3xl font-bold mb-2"
                style={{ color: "var(--blue)" }}
              >
                10%
              </div>
              <p
                className="font-semibold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Bronze Tier
              </p>
              <p
                className="text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                0-10 referrals
              </p>
            </div>

            <div
              className="p-6 rounded-xl text-center"
              style={{
                background: "var(--glass-bg-subtle)",
                border: "2px solid var(--purple)",
              }}
            >
              <div
                className="text-3xl font-bold mb-2"
                style={{ color: "var(--purple)" }}
              >
                20%
              </div>
              <p
                className="font-semibold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Silver Tier
              </p>
              <p
                className="text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                11-50 referrals
              </p>
            </div>

            <div
              className="p-6 rounded-xl text-center"
              style={{
                background: "var(--glass-bg-subtle)",
                border: "1px solid var(--divider)",
              }}
            >
              <div
                className="text-3xl font-bold mb-2"
                style={{ color: "var(--yellow)" }}
              >
                30%
              </div>
              <p
                className="font-semibold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Gold Tier
              </p>
              <p
                className="text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                51+ referrals
              </p>
            </div>
          </div>
        </div>

        <div
          className="p-8 rounded-2xl text-center"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <h3
            className="text-xl font-semibold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Ready to Start Earning?
          </h3>
          <p
            className="mb-6 max-w-2xl mx-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            Join thousands of affiliates who are already earning by promoting
            Gracyglobal. It's free to join and takes less than a minute.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/affiliate"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg text-white font-semibold text-lg"
              style={{
                background:
                  "linear-gradient(135deg, var(--purple), var(--blue))",
              }}
            >
              Join Affiliate Program
              <ExternalLink className="w-5 h-5" />
            </Link>
            <Link
              href="/affiliate"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-semibold text-lg"
              style={{
                background: "var(--glass-bg-subtle)",
                color: "var(--text-primary)",
                border: "1px solid var(--divider)",
              }}
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          Affiliate Dashboard
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Track your referrals and earnings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className="p-6 rounded-2xl"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="p-3 rounded-lg"
              style={{ background: "var(--info-bg)" }}
            >
              <Users className="w-6 h-6" style={{ color: "var(--blue)" }} />
            </div>
            <div>
              <p
                className="text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                Total Referrals
              </p>
              <p
                className="text-2xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {affiliate.totalReferrals}
              </p>
            </div>
          </div>
        </div>

        <div
          className="p-6 rounded-2xl"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="p-3 rounded-lg"
              style={{ background: "var(--success-bg)" }}
            >
              <DollarSign
                className="w-6 h-6"
                style={{ color: "var(--green)" }}
              />
            </div>
            <div>
              <p
                className="text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                Total Earnings
              </p>
              <p
                className="text-2xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {affiliate.totalEarnings.toLocaleString()} XAF
              </p>
            </div>
          </div>
        </div>

        <div
          className="p-6 rounded-2xl"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="p-3 rounded-lg"
              style={{ background: "var(--warning-bg)" }}
            >
              <TrendingUp
                className="w-6 h-6"
                style={{ color: "var(--yellow)" }}
              />
            </div>
            <div>
              <p
                className="text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                Pending Payout
              </p>
              <p
                className="text-2xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {affiliate.pendingPayout.toLocaleString()} XAF
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        className="p-6 rounded-2xl"
        style={{
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
        }}
      >
        <h2
          className="text-xl font-semibold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Your Affiliate Link
        </h2>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={affiliateLink}
            readOnly
            className="flex-1 px-4 py-3 rounded-lg"
            style={{
              background: "var(--glass-bg-subtle)",
              border: "1px solid var(--divider)",
              color: "var(--text-primary)",
            }}
          />
          <button
            onClick={() => copyToClipboard(affiliateLink)}
            className="px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all"
            style={{
              background: copied ? "var(--green)" : "var(--blue)",
              color: "white",
            }}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </button>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <div>
            <p
              className="text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Tier: <span className="font-semibold">{affiliate.tier}</span>
            </p>
          </div>
          <div>
            <p
              className="text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Commission Rate:{" "}
              <span className="font-semibold">{affiliate.commissionRate}%</span>
            </p>
          </div>
        </div>
      </div>

      {affiliate.referrals.length > 0 && (
        <div
          className="p-6 rounded-2xl"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <h2
            className="text-xl font-semibold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Recent Referrals
          </h2>
          <div className="space-y-3">
            {affiliate.referrals.map((referral) => (
              <div
                key={referral.id}
                className="flex items-center justify-between p-4 rounded-lg"
                style={{ background: "var(--glass-bg-subtle)" }}
              >
                <div>
                  <p
                    className="font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {referral.name}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {referral.email}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {new Date(referral.createdAt).toLocaleDateString()}
                  </p>
                  <span
                    className="text-xs px-2 py-1 rounded-full"
                    style={{
                      background: "var(--success-bg)",
                      color: "var(--green)",
                    }}
                  >
                    {referral.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
