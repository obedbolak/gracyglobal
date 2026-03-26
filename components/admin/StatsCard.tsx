// components/admin/StatsCard.tsx

import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "purple" | "scarlet" | "blue";
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "purple",
}: StatsCardProps) {
  const colorClasses = {
    purple: "bg-[var(--purple-faint)] text-[var(--purple)]",
    scarlet: "bg-[var(--scarlet-faint)] text-[var(--scarlet)]",
    blue: "bg-[var(--blue-faint)] text-[var(--blue)]",
  };

  return (
    <div className="glass p-6 rounded-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[var(--text-muted)] mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-[var(--text-primary)]">
            {value}
          </h3>
          {trend && (
            <p
              className={`text-sm mt-2 ${
                trend.isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}% from last
              month
            </p>
          )}
        </div>

        <div className={`p-4 rounded-full ${colorClasses[color]}`}>
          <Icon className="w-8 h-8" />
        </div>
      </div>
    </div>
  );
}
