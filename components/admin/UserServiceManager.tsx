"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface UserServiceManagerProps {
  userId: string;
  currentRoles: string[];
  onUpdate?: () => void;
}

const SERVICE_CONFIGS = {
  COUNSELOR: {
    label: "Counselor Service",
    freePlanCode: "C3", // Free counselor plan
    description: "Enable counseling services and create counselor profile",
  },
  TEACHER: {
    label: "Teacher Service", 
    freePlanCode: "T3", // Free teacher plan
    description: "Enable course creation and teaching capabilities",
  },
  CREATOR: {
    label: "Service Creator",
    freePlanCode: "S3", // Free service plan
    description: "Enable service creation and management",
  },
  MARKETPLACE: {
    label: "Marketplace Seller",
    freePlanCode: "S3", // Free service plan (same as creator)
    description: "Enable product selling in marketplace",
  },
};

export default function UserServiceManager({ 
  userId, 
  currentRoles, 
  onUpdate 
}: UserServiceManagerProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const updateServiceState = async (serviceType: string, activate: boolean) => {
    setLoading(serviceType);
    try {
      const config = SERVICE_CONFIGS[serviceType as keyof typeof SERVICE_CONFIGS];
      
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
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Service Management</h3>
      <div className="space-y-3">
        {Object.entries(SERVICE_CONFIGS).map(([serviceType, config]) => {
          const isActive = currentRoles.includes(serviceType);
          const isLoading = loading === serviceType;
          
          return (
            <div key={serviceType} className="flex items-center justify-between p-3 border rounded">
              <div>
                <div className="font-medium">{config.label}</div>
                <div className="text-sm text-gray-600">{config.description}</div>
                <div className="text-xs text-gray-500">
                  Free Plan: {config.freePlanCode}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  isActive 
                    ? "bg-green-100 text-green-800" 
                    : "bg-gray-100 text-gray-600"
                }`}>
                  {isActive ? "Active" : "Inactive"}
                </span>
                <Button
                  size="sm"
                  variant={isActive ? "destructive" : "default"}
                  onClick={() => updateServiceState(serviceType, !isActive)}
                  disabled={isLoading}
                >
                  {isLoading ? "..." : isActive ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}