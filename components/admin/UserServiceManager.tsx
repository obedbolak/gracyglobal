"use client";

import { useState } from "react";

interface UserServiceManagerProps {
  userId: string;
  currentRoles: string[];
  onUpdate?: () => void;
}

const SERVICE_CONFIGS = {
  COUNSELOR: {
    label: "Counselor Service",
    freePlanCode: "S3", // Use service plan for counselors
    description: "Enable counseling services and create counselor profile",
    icon: "❤️",
    color: "var(--blue)",
    bg: "var(--info-bg)",
    border: "var(--info-border)",
  },
  TEACHER: {
    label: "Teacher Service",
    freePlanCode: "T3",
    description: "Enable course creation and teaching capabilities",
    icon: "🎓",
    color: "var(--purple)",
    bg: "var(--badge-purple-bg)",
    border: "rgba(123, 47, 190, 0.25)",
  },
  CREATOR: {
    label: "Service Creator",
    freePlanCode: "C3", // C3 is for Creator
    description: "Enable service creation and management",
    icon: "🛠️",
    color: "var(--success-text)",
    bg: "var(--success-bg)",
    border: "var(--success-border)",
  },
  MARKETPLACE: {
    label: "Marketplace Seller",
    freePlanCode: "M3",
    description: "Enable product selling in marketplace",
    icon: "🛒",
    color: "var(--text-secondary)",
    bg: "var(--glass-bg-subtle)",
    border: "var(--glass-border)",
  },
};

export default function UserServiceManager({
  userId,
  currentRoles,
  onUpdate,
}: UserServiceManagerProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const updateServiceState = async (serviceType: string, activate: boolean) => {
    setLoading(serviceType);
    try {
      const config =
        SERVICE_CONFIGS[serviceType as keyof typeof SERVICE_CONFIGS];

      const response = await fetch(`/api/admin/users/${userId}/services`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType,
          activate,
          planCode: activate ? config.freePlanCode : config.freePlanCode,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update service");
      }

      onUpdate?.();
    } catch (error: any) {
      console.error("Error updating service:", error);
      alert(error.message || "Failed to update service");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div
      className="p-6 rounded-2xl"
      style={{
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-border)",
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <h2
          className="text-lg font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Service Management
        </h2>
        <span
          className="text-xs px-2.5 py-1 rounded-full font-medium"
          style={{
            background: "var(--badge-purple-bg)",
            color: "var(--badge-purple-text)",
          }}
        >
          {
            currentRoles.filter((role) =>
              Object.keys(SERVICE_CONFIGS).includes(role),
            ).length
          }{" "}
          service
          {currentRoles.filter((role) =>
            Object.keys(SERVICE_CONFIGS).includes(role),
          ).length !== 1
            ? "s"
            : ""}{" "}
          active
        </span>
      </div>
      <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>
        Activate services to grant users access to specific platform features
        and automatically assign free plans.
      </p>

      <div className="space-y-3">
        {Object.entries(SERVICE_CONFIGS).map(([serviceType, config]) => {
          const isActive = currentRoles.includes(serviceType);
          const isLoading = loading === serviceType;

          return (
            <div
              key={serviceType}
              className="w-full text-left p-4 rounded-xl transition-all duration-200"
              style={{
                background: isActive ? config.bg : "var(--glass-bg-subtle)",
                border: isActive
                  ? `2px solid ${config.border}`
                  : "2px solid transparent",
                boxShadow: isActive ? "var(--glass-shadow)" : "none",
              }}
            >
              <div className="flex items-start gap-3">
                {/* Status indicator */}
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                  style={{
                    background: isActive
                      ? `linear-gradient(135deg, ${config.color}, var(--purple))`
                      : "var(--glass-bg)",
                    border: isActive ? "none" : "2px solid var(--glass-border)",
                  }}
                >
                  {isActive && (
                    <div className="w-3.5 h-3.5 bg-white rounded-sm" />
                  )}
                </div>

                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                  style={{
                    background: isActive ? config.bg : "var(--glass-bg)",
                    border: `1px solid ${isActive ? config.border : "var(--glass-border)"}`,
                  }}
                >
                  {config.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="font-bold text-sm"
                        style={{
                          color: isActive
                            ? "var(--text-primary)"
                            : "var(--text-secondary)",
                        }}
                      >
                        {config.label}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          background: isActive
                            ? "var(--success-bg)"
                            : "var(--glass-bg)",
                          color: isActive
                            ? "var(--success-text)"
                            : "var(--text-muted)",
                          border: `1px solid ${isActive ? "var(--success-border)" : "var(--glass-border)"}`,
                        }}
                      >
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <button
                      onClick={() => updateServiceState(serviceType, !isActive)}
                      disabled={isLoading}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                      style={{
                        background: isActive
                          ? "var(--error-bg)"
                          : "linear-gradient(135deg, var(--purple), var(--blue))",
                        color: isActive ? "var(--error-text)" : "#fff",
                        border: isActive
                          ? "1px solid var(--error-border)"
                          : "none",
                        boxShadow: !isActive
                          ? "0 2px 8px rgba(123,47,190,0.3)"
                          : "none",
                      }}
                    >
                      {isLoading ? "..." : isActive ? "Deactivate" : "Activate"}
                    </button>
                  </div>

                  <p
                    className="text-xs leading-relaxed mb-2"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {config.description}
                  </p>

                  <div
                    className="text-xs flex items-center gap-1"
                    style={{ color: config.color }}
                  >
                    <span>📋</span>
                    Free Plan: {config.freePlanCode}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
