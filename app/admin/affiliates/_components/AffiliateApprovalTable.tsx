"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

interface AffiliateCommissionRow {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  paymentId: string;
  affiliate: {
    user: {
      name: string | null;
      email: string;
    };
  };
  referral: {
    referredUser: {
      name: string | null;
      email: string;
    };
  };
}

export function AffiliateApprovalTable({
  commissions,
}: {
  commissions: AffiliateCommissionRow[];
}) {
  const [rows, setRows] = useState(commissions);
  const [approvingIds, setApprovingIds] = useState<string[]>([]);

  const handleApprove = async (id: string) => {
    setApprovingIds((current) => [...current, id]);

    try {
      const response = await fetch(`/api/admin/affiliate-commissions/${id}`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error("Failed to approve commission");
      }

      setRows((current) => current.filter((row) => row.id !== id));
    } catch (error) {
      console.error(error);
    } finally {
      setApprovingIds((current) => current.filter((itemId) => itemId !== id));
    }
  };

  if (rows.length === 0) {
    return (
      <div className="glass border border-dashed border-[var(--divider)] rounded-3xl p-8 text-center">
        <p className="text-[var(--text-muted)]">No pending affiliate commissions awaiting approval.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left border-separate border-spacing-y-3">
        <thead>
          <tr>
            <th className="px-4 py-3 text-sm font-semibold text-[var(--text-secondary)]">Affiliate</th>
            <th className="px-4 py-3 text-sm font-semibold text-[var(--text-secondary)]">Referral</th>
            <th className="px-4 py-3 text-sm font-semibold text-[var(--text-secondary)]">Amount</th>
            <th className="px-4 py-3 text-sm font-semibold text-[var(--text-secondary)]">Created</th>
            <th className="px-4 py-3 text-sm font-semibold text-[var(--text-secondary)]">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((commission) => {
            const isApproving = approvingIds.includes(commission.id);
            return (
              <tr key={commission.id} className="bg-[var(--bg-base)] rounded-3xl border border-[var(--divider)]">
                <td className="px-4 py-4 align-top">
                  <div className="font-semibold text-[var(--text-primary)]">
                    {commission.affiliate.user.name ?? commission.affiliate.user.email}
                  </div>
                  <div className="text-sm text-[var(--text-muted)]">{commission.affiliate.user.email}</div>
                </td>
                <td className="px-4 py-4 align-top">
                  <div className="font-medium text-[var(--text-primary)]">
                    {commission.referral.referredUser.name ?? commission.referral.referredUser.email}
                  </div>
                  <div className="text-sm text-[var(--text-muted)]">Referral</div>
                </td>
                <td className="px-4 py-4 align-top font-semibold text-[var(--text-primary)]">
                  CFA {commission.amount.toLocaleString()}
                </td>
                <td className="px-4 py-4 align-top text-sm text-[var(--text-muted)]">
                  {new Date(commission.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="px-4 py-4 align-top">
                  <button
                    type="button"
                    onClick={() => handleApprove(commission.id)}
                    disabled={isApproving}
                    className="btn-primary inline-flex items-center gap-2 px-4 py-2 rounded-xl"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {isApproving ? "Approving..." : "Approve"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
