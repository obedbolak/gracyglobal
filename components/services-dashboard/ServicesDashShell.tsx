"use client";

import { useCallback, useEffect, useState } from "react";
import ServicesDashSidebar, {
  ServicesDashMobileSidebar,
  type DashboardSession,
  type ServicesView,
} from "@/components/services-dashboard/ServicesDashSidebar";
import ServicesDashPageContent from "@/app/services-dashboard/ServicesDashPageContent";
import type { BusinessProfile } from "@/components/business/BusinessProfileSettings";

function isProfileIncomplete(profile: BusinessProfile | null): boolean {
  if (!profile) return true;
  return !profile.businessName || !profile.location || !profile.openingHours;
}

export default function ServicesDashShell({ session }: { session: DashboardSession }) {
  const [collapsed, setCollapsed] = useState(false);
  const [view, setView] = useState<ServicesView>("overview");
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/store");
      if (res.ok) {
        const data = await res.json();
        setProfile(data.store ?? null);
      }
    } catch {
      // Treat failures as incomplete.
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const profileIncomplete = !loadingProfile && isProfileIncomplete(profile);

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <ServicesDashSidebar collapsed={collapsed} onToggleCollapse={setCollapsed} session={session} activeView={view} onViewChange={setView} profileIncomplete={profileIncomplete} />
      <ServicesDashMobileSidebar session={session} activeView={view} onViewChange={setView} profileIncomplete={profileIncomplete} />
      <main className={`flex-1 p-8 transition-all duration-300 ${collapsed ? "lg:ml-20" : "lg:ml-64"}`}>
        <div className="max-w-7xl mx-auto">
          <ServicesDashPageContent view={view} setView={setView} profile={profile} onProfileSaved={setProfile} profileIncomplete={profileIncomplete} />
        </div>
      </main>
    </div>
  );
}
