"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar,
  ShoppingBag,
  Briefcase,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";

interface Activity {
  id: string;
  type: 'booking' | 'order' | 'application' | 'post';
  title: string;
  description: string;
  status: string;
  date: string;
  href?: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'booking':
        return Calendar;
      case 'order':
        return ShoppingBag;
      case 'application':
        return Briefcase;
      case 'post':
        return MessageSquare;
      default:
        return Clock;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'confirmed':
      case 'delivered':
      case 'hired':
        return CheckCircle;
      case 'cancelled':
      case 'rejected':
      case 'failed':
        return XCircle;
      case 'pending':
      case 'processing':
      case 'applied':
        return AlertCircle;
      default:
        return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'confirmed':
      case 'delivered':
      case 'hired':
        return { background: "var(--success-bg)", color: "var(--green)" };
      case 'cancelled':
      case 'rejected':
      case 'failed':
        return { background: "var(--error-bg)", color: "var(--error-text)" };
      case 'pending':
      case 'processing':
      case 'applied':
        return { background: "var(--warning-bg)", color: "var(--yellow)" };
      default:
        return { background: "var(--glass-bg)", color: "var(--text-secondary)" };
    }
  };

  if (activities.length === 0) {
    return (
      <div className="p-6 rounded-2xl" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Recent Activity</h3>
        <div className="text-center py-8">
          <Clock className="w-12 h-12 mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
          <p style={{ color: "var(--text-secondary)" }}>No recent activity</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Your recent actions will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
      <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Recent Activity</h3>
      <div className="space-y-4">
        {activities.slice(0, 5).map((activity) => {
          const ActivityIcon = getActivityIcon(activity.type);
          const StatusIcon = getStatusIcon(activity.status);
          const statusStyle = getStatusColor(activity.status);
          
          return (
            <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg transition-colors" style={{ background: "var(--glass-bg-subtle)" }}>
              <div className="p-2 rounded-lg" style={{ background: "var(--info-bg)" }}>
                <ActivityIcon className="w-4 h-4" style={{ color: "var(--blue)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                    {activity.title}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1" style={statusStyle}>
                      <StatusIcon className="w-3 h-3" />
                      {activity.status}
                    </span>
                  </div>
                </div>
                <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                  {activity.description}
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  {activity.date}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      {activities.length > 5 && (
        <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--divider)" }}>
          <button className="text-sm font-medium transition-colors" style={{ color: "var(--blue)" }}>
            View all activity
          </button>
        </div>
      )}
    </div>
  );
}