// app/admin/counselors/page.tsx

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Star, CheckCircle, Package } from "lucide-react";
import { CounselorActions } from "./_components/CounselorActions";

export default async function CounselorsPage() {
  const counselors = await prisma.counselor.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          country: true,
        },
      },
      _count: {
        select: { bookings: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Counselors
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Manage counselor profiles and availability
          </p>
        </div>

        <Link
          href="/admin/counselors/create"
          className="btn-primary flex items-center gap-2 px-6 py-3 rounded-lg"
        >
          <Plus className="w-5 h-5" />
          Add Counselor
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass p-4 rounded-xl">
          <p className="text-sm text-[var(--text-muted)]">Total Counselors</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
            {counselors.length}
          </p>
        </div>
        <div className="glass p-4 rounded-xl">
          <p className="text-sm text-[var(--text-muted)]">Available</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {counselors.filter((c) => c.available).length}
          </p>
        </div>
        <div className="glass p-4 rounded-xl">
          <p className="text-sm text-[var(--text-muted)]">Verified</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {counselors.filter((c) => c.verified).length}
          </p>
        </div>
        <div className="glass p-4 rounded-xl">
          <p className="text-sm text-[var(--text-muted)]">Total Bookings</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
            {counselors.reduce((acc, c) => acc + c._count.bookings, 0)}
          </p>
        </div>
      </div>

      {/* Counselors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {counselors.map((counselor) => (
          <div
            key={counselor.id}
            className="glass rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Counselor Image */}
            {counselor.user.image ? (
              <div className="relative h-48">
                <img
                  src={counselor.user.image}
                  alt={counselor.user.name || "Counselor"}
                  className="w-full h-full object-cover"
                />
                {counselor.available && (
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-green-500/90 text-white text-xs font-semibold rounded-full">
                      Available
                    </span>
                  </div>
                )}
                {counselor.verified && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle className="w-6 h-6 text-blue-500 bg-white rounded-full" />
                  </div>
                )}
              </div>
            ) : (
              <div className="h-48 bg-gradient-to-br from-[var(--purple-faint)] to-[var(--glass-bg)] flex items-center justify-center">
                <Package className="w-16 h-16 text-[var(--text-muted)] opacity-50" />
              </div>
            )}

            {/* Counselor Info */}
            <div className="p-6 space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] line-clamp-1">
                    {counselor.user.name || "Unnamed Counselor"}
                  </h3>
                  {counselor.verified && (
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                  )}
                </div>
                <p className="text-sm text-[var(--text-muted)]">
                  {counselor.user.email}
                </p>
                <p className="text-sm text-[var(--text-secondary)] mt-1 line-clamp-1">
                  {counselor.specialty}
                </p>
              </div>

              {/* Bio */}
              {counselor.bio && (
                <p className="text-sm text-[var(--text-muted)] line-clamp-2">
                  {counselor.bio}
                </p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[var(--divider)]">
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Rating</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <p className="text-sm font-semibold text-[var(--text-secondary)]">
                      {counselor.rating.toFixed(1)}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Reviews</p>
                  <p className="text-sm font-semibold text-[var(--text-secondary)]">
                    {counselor.reviews}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Bookings</p>
                  <p className="text-sm font-semibold text-[var(--text-secondary)]">
                    {counselor._count.bookings}
                  </p>
                </div>
              </div>

              {/* Price */}
              <div className="pt-3 border-t border-[var(--divider)]">
                <p className="text-xs text-[var(--text-muted)] mb-1">
                  Price per Hour
                </p>
                <p className="text-lg font-bold text-[var(--purple)]">
                  {counselor.pricePerHour.toLocaleString()} XAF
                </p>
              </div>

              {/* Status Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    counselor.available
                      ? "bg-green-500/20 text-green-600"
                      : "bg-gray-500/20 text-gray-600"
                  }`}
                >
                  {counselor.available ? "Available" : "Unavailable"}
                </span>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    counselor.verified
                      ? "bg-blue-500/20 text-blue-600"
                      : "bg-yellow-500/20 text-yellow-600"
                  }`}
                >
                  {counselor.verified ? "Verified" : "Unverified"}
                </span>
              </div>

              {/* Actions */}
              <CounselorActions
                counselorId={counselor.id}
                counselorName={counselor.user.name || "this counselor"}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {counselors.length === 0 && (
        <div className="glass rounded-xl p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-[var(--purple-faint)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-[var(--purple)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              No counselors yet
            </h3>
            <p className="text-[var(--text-muted)] mb-6">
              Add your first counselor to get started
            </p>
            <Link
              href="/admin/counselors/create"
              className="inline-flex items-center gap-2 btn-primary px-6 py-3 rounded-lg"
            >
              <Plus className="w-5 h-5" />
              Add Counselor
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
