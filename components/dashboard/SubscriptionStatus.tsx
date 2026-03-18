"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Crown,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ArrowRight
} from "lucide-react";

interface SubscriptionStatusProps {
  subscription?: {
    plan: {
      name: string;
      displayName: string;
      counselorSessions: number;
      priceMonthly: number;
    };
    status: string;
    currentPeriodEnd: string;
    sessionsUsed: number;
    cancelAtPeriodEnd: boolean;
  };
}

export default function SubscriptionStatus({ subscription }: SubscriptionStatusProps) {
  if (!subscription) {
    return (
      <Card className="p-6 border-dashed border-2 border-gray-200">
        <div className="text-center">
          <Crown className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Active Subscription
          </h3>
          <p className="text-gray-500 mb-4">
            Upgrade to unlock premium features and unlimited access
          </p>
          <Link href="/community">
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              View Plans
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </Link>
        </div>
      </Card>
    );
  }

  const { plan, status, currentPeriodEnd, sessionsUsed, cancelAtPeriodEnd } = subscription;
  const sessionsRemaining = plan.counselorSessions - sessionsUsed;
  const usagePercentage = plan.counselorSessions > 0 
    ? (sessionsUsed / plan.counselorSessions) * 100 
    : 0;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'past_due':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'trialing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return CheckCircle;
      case 'past_due':
      case 'cancelled':
        return AlertTriangle;
      default:
        return TrendingUp;
    }
  };

  const StatusIcon = getStatusIcon(status);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Subscription</h3>
        <Badge className={getStatusColor(status)}>
          <StatusIcon className="w-3 h-3 mr-1" />
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      </div>

      <div className="space-y-4">
        {/* Plan Info */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">{plan.displayName}</h4>
            <p className="text-sm text-gray-500">
              {plan.priceMonthly > 0 
                ? `${plan.priceMonthly.toLocaleString()} CFA/month`
                : 'Free Plan'
              }
            </p>
          </div>
          <Crown className="w-6 h-6 text-yellow-500" />
        </div>

        {/* Session Usage */}
        {plan.counselorSessions > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Counseling Sessions
              </span>
              <span className="text-sm text-gray-500">
                {sessionsUsed} / {plan.counselorSessions}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  usagePercentage >= 90 ? 'bg-red-500' :
                  usagePercentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {sessionsRemaining > 0 
                ? `${sessionsRemaining} sessions remaining`
                : 'No sessions remaining'
              }
            </p>
          </div>
        )}

        {/* Renewal Info */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-500">
            <Calendar className="w-4 h-4 mr-1" />
            {cancelAtPeriodEnd ? 'Expires' : 'Renews'} on
          </div>
          <span className="font-medium text-gray-900">
            {new Date(currentPeriodEnd).toLocaleDateString()}
          </span>
        </div>

        {/* Warnings */}
        {cancelAtPeriodEnd && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
              <p className="text-sm text-yellow-800">
                Your subscription will not renew automatically
              </p>
            </div>
          </div>
        )}

        {usagePercentage >= 90 && plan.counselorSessions > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
              <p className="text-sm text-red-800">
                You're running low on counseling sessions
              </p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <Link href="/community">
          <button className="w-full mt-4 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            Manage Subscription
          </button>
        </Link>
      </div>
    </Card>
  );
}