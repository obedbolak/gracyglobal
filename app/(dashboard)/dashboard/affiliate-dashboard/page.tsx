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
  Clock,
  BadgeCheck,
} from "lucide-react";

interface Commission {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface Payout {
  id: string;
  amount: number;
  status: string;
  method: string;
  requestedAt: string;
  processedAt: string | null;
}

interface Referral {
  id: string;
  name: string;
  email: string;
  status: "PENDING" | "CONVERTED" | "EXPIRED";
  createdAt: string;
  convertedAt: string | null;
  joinedAt: string;
}

interface AffiliateData {
  id: string;
  code: string;
  commissionRate: number; // already × 100, e.g. 20
  totalReferrals: number;
  totalEarnings: number;
  pendingPayout: number;
  active: boolean;
  createdAt: string;
  referrals: Referral[];
  commissions: Commission[];
  payouts: Payout[];
}

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: "var(--warning-bg)", color: "var(--yellow)" },
  CONVERTED: { bg: "var(--success-bg)", color: "var(--green)" },
  EXPIRED: { bg: "var(--glass-bg-subtle)", color: "var(--text-disabled)" },
};

const COMMISSION_STATUS_STYLES: Record<string, { bg: string; color: string }> =
  {
    PENDING: { bg: "var(--warning-bg)", color: "var(--yellow)" },
    APPROVED: { bg: "var(--info-bg)", color: "var(--blue)" },
    PAID: { bg: "var(--success-bg)", color: "var(--green)" },
    CANCELLED: { bg: "var(--glass-bg-subtle)", color: "var(--text-disabled)" },
  };

export default function AffiliateDashboardPage() {
  const [affiliate, setAffiliate] = useState<AffiliateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [affiliateLink, setAffiliateLink] = useState("");

  useEffect(() => {
    fetchAffiliateData();
  }, []);

  useEffect(() => {
    if (affiliate) {
      setAffiliateLink(
        `${window.location.origin}/register?ref=${affiliate.code}`,
      );
    }
  }, [affiliate]);

  async function fetchAffiliateData() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/affiliates");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to fetch");
      setAffiliate(data.affiliate ?? null);
    } catch (err: any) {
      setError(err.message ?? "Failed to load affiliate data");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    setJoining(true);
    setError("");
    try {
      const res = await fetch("/api/affiliates", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to join");
      await fetchAffiliateData();
    } catch (err: any) {
      setError(err.message ?? "Failed to join affiliate program");
    } finally {
      setJoining(false);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(affiliateLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Loading ──────────────────────────────────────────────────────────────
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

  // ── Error ────────────────────────────────────────────────────────────────
  if (error && !affiliate) {
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
            Something went wrong
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

  // ── Not yet an affiliate ─────────────────────────────────────────────────
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
            Earn commissions by referring people to Gracyglobal
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
            <p className="text-lg max-w-2xl mx-auto opacity-90">
              Share your unique link. When someone signs up and subscribes to
              any plan — Counsellor, Teacher, Marketplace, or Service — you earn
              a commission on every payment they make.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Users,
              color: "var(--blue)",
              bg: "var(--info-bg)",
              title: "Share Your Link",
              desc: "Get a unique referral link to share with your network",
            },
            {
              icon: TrendingUp,
              color: "var(--green)",
              bg: "var(--success-bg)",
              title: "Earn on Any Plan",
              desc: "Commissions apply to Counsellor, Teacher, Marketplace, and Service plans",
            },
            {
              icon: DollarSign,
              color: "var(--yellow)",
              bg: "var(--warning-bg)",
              title: "Get Paid",
              desc: "Receive payouts directly to your mobile money account",
            },
          ].map(({ icon: Icon, color, bg, title, desc }) => (
            <div
              key={title}
              className="p-6 rounded-2xl text-center"
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
              }}
            >
              <div
                className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ background: bg }}
              >
                <Icon className="w-6 h-6" style={{ color }} />
              </div>
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                {title}
              </h3>
              <p style={{ color: "var(--text-secondary)" }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* Plans covered */}
        <div
          className="p-8 rounded-2xl"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <h3
            className="text-xl font-bold mb-6 text-center"
            style={{ color: "var(--text-primary)" }}
          >
            Plans You Earn On
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "Counsellor",
                desc: "Therapy & coaching",
                color: "var(--blue)",
              },
              {
                label: "Teacher",
                desc: "Course creators",
                color: "var(--purple)",
              },
              { label: "Marketplace", desc: "Sellers", color: "var(--yellow)" },
              {
                label: "Service",
                desc: "Service providers",
                color: "var(--green)",
              },
            ].map(({ label, desc, color }) => (
              <div
                key={label}
                className="p-5 rounded-xl text-center"
                style={{
                  background: "var(--glass-bg-subtle)",
                  border: "1px solid var(--divider)",
                }}
              >
                <div className="text-2xl font-bold mb-1" style={{ color }}>
                  20%
                </div>
                <p
                  className="font-semibold text-sm mb-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  {label}
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>
          <p
            className="text-center text-xs mt-4"
            style={{ color: "var(--text-disabled)" }}
          >
            Commission applies to every recurring payment, not just the first
            one.
          </p>
        </div>

        {error && (
          <p
            className="text-center text-sm"
            style={{ color: "var(--error-text)" }}
          >
            {error}
          </p>
        )}

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
            Free to join. Your referral link is generated instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleJoin}
              disabled={joining}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg text-white font-semibold text-lg disabled:opacity-60"
              style={{
                background:
                  "linear-gradient(135deg, var(--purple), var(--blue))",
              }}
            >
              {joining ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Share2 className="w-5 h-5" />
              )}
              {joining ? "Setting up..." : "Join Affiliate Program"}
            </button>
            <Link
              href="/affiliate"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-semibold text-lg"
              style={{
                background: "var(--glass-bg-subtle)",
                color: "var(--text-primary)",
                border: "1px solid var(--divider)",
              }}
            >
              Learn More <ExternalLink className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Active affiliate dashboard ────────────────────────────────────────────
  const convertedCount = affiliate.referrals.filter(
    (r) => r.status === "CONVERTED",
  ).length;

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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: "Total Signups",
            value: affiliate.totalReferrals.toString(),
            icon: Users,
            color: "var(--blue)",
            bg: "var(--info-bg)",
          },
          {
            label: "Total Earned",
            value: `${affiliate.totalEarnings.toLocaleString()} XAF`,
            icon: DollarSign,
            color: "var(--green)",
            bg: "var(--success-bg)",
          },
          {
            label: "Pending Payout",
            value: `${affiliate.pendingPayout.toLocaleString()} XAF`,
            icon: TrendingUp,
            color: "var(--yellow)",
            bg: "var(--warning-bg)",
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="p-6 rounded-2xl"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg" style={{ background: bg }}>
                <Icon className="w-6 h-6" style={{ color }} />
              </div>
              <div>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {label}
                </p>
                <p
                  className="text-2xl font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Referral link */}
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
          Your Referral Link
        </h2>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={affiliateLink}
            readOnly
            className="flex-1 px-4 py-3 rounded-lg text-sm"
            style={{
              background: "var(--glass-bg-subtle)",
              border: "1px solid var(--divider)",
              color: "var(--text-primary)",
            }}
          />
          <button
            onClick={copyLink}
            className="px-5 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all whitespace-nowrap"
            style={{
              background: copied ? "var(--green)" : "var(--blue)",
              color: "white",
            }}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" /> Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copy
              </>
            )}
          </button>
        </div>
        <div
          className="mt-3 flex flex-wrap items-center gap-6 text-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          <span>
            Code:{" "}
            <strong style={{ color: "var(--text-primary)" }}>
              {affiliate.code}
            </strong>
          </span>
          <span>
            Commission:{" "}
            <strong style={{ color: "var(--green)" }}>
              {affiliate.commissionRate}% per payment
            </strong>
          </span>
          <span>
            Subscribed:{" "}
            <strong style={{ color: "var(--text-primary)" }}>
              {convertedCount} / {affiliate.totalReferrals}
            </strong>
          </span>
        </div>
        <p className="mt-2 text-xs" style={{ color: "var(--text-disabled)" }}>
          Applies to Counsellor, Teacher, Marketplace, and Service plans —
          including recurring payments.
        </p>
      </div>

      {/* Referrals */}
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
          Referrals{" "}
          <span
            className="text-sm font-normal ml-1"
            style={{ color: "var(--text-secondary)" }}
          >
            ({affiliate.referrals.length})
          </span>
        </h2>
        {affiliate.referrals.length === 0 ? (
          <div className="text-center py-10">
            <Users
              className="w-10 h-10 mx-auto mb-3"
              style={{ color: "var(--text-disabled)" }}
            />
            <p style={{ color: "var(--text-secondary)" }}>
              No referrals yet. Share your link to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {affiliate.referrals.map((r) => {
              const s = STATUS_STYLES[r.status] ?? STATUS_STYLES.PENDING;
              return (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-4 rounded-lg"
                  style={{ background: "var(--glass-bg-subtle)" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{
                        background: "var(--info-bg)",
                        color: "var(--blue)",
                      }}
                    >
                      {r.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p
                        className="font-semibold text-sm"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {r.name}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {r.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1"
                      style={{ background: s.bg, color: s.color }}
                    >
                      {r.status === "CONVERTED" ? (
                        <>
                          <BadgeCheck className="w-3 h-3" /> Subscribed
                        </>
                      ) : r.status === "PENDING" ? (
                        <>
                          <Clock className="w-3 h-3" /> Signed up
                        </>
                      ) : (
                        "Expired"
                      )}
                    </span>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-disabled)" }}
                    >
                      {new Date(r.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Commissions */}
      {affiliate.commissions.length > 0 && (
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
            Commissions
          </h2>
          <div className="space-y-3">
            {affiliate.commissions.map((c) => {
              const s =
                COMMISSION_STATUS_STYLES[c.status] ??
                COMMISSION_STATUS_STYLES.PENDING;
              return (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-4 rounded-lg"
                  style={{ background: "var(--glass-bg-subtle)" }}
                >
                  <div>
                    <p
                      className="font-semibold text-sm"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {c.amount.toLocaleString()} XAF
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {new Date(c.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: s.bg, color: s.color }}
                  >
                    {c.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Payouts */}
      {affiliate.payouts.length > 0 && (
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
            Payout History
          </h2>
          <div className="space-y-3">
            {affiliate.payouts.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-4 rounded-lg"
                style={{ background: "var(--glass-bg-subtle)" }}
              >
                <div>
                  <p
                    className="font-semibold text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {p.amount.toLocaleString()} XAF
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {p.method.replace(/_/g, " ")} ·{" "}
                    {new Date(p.requestedAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    background:
                      p.status === "PAID"
                        ? "var(--success-bg)"
                        : p.status === "FAILED"
                          ? "var(--error-bg)"
                          : "var(--warning-bg)",
                    color:
                      p.status === "PAID"
                        ? "var(--green)"
                        : p.status === "FAILED"
                          ? "var(--error-text)"
                          : "var(--yellow)",
                  }}
                >
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
