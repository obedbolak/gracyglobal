"use client";

import { useState, useEffect, useCallback } from "react";
import StoreSidebar, {
  StoreMobileSidebar,
  StoreView,
} from "@/components/store/StoreSidebar";
import StorePageContent from "@/app/store/StorePageContent";

export interface StoreProfile {
  id: string;
  businessName: string;
  businessType?: string | null;
  image?: string | null;
  location?: string | null;
  quarter?: string | null;
  openingHours?: string | null;
  description?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
}

// Profile is "incomplete" if the store record is missing or key fields are blank.
function isStoreIncomplete(p: StoreProfile | null): boolean {
  if (!p) return true;
  return !p.businessName || !p.location || !p.openingHours;
}

export default function StoreShell({ session }: { session: any }) {
  const [collapsed, setCollapsed] = useState(false);
  const [view, setView] = useState<StoreView>("overview");
  const [store, setStore] = useState<StoreProfile | null>(null);
  const [loadingStore, setLoadingStore] = useState(true);

  const loadStore = useCallback(async () => {
    try {
      const res = await fetch("/api/store");
      if (res.ok) {
        const data = await res.json();
        setStore(data.store ?? null);
      }
    } catch {
      // ignore; treat as incomplete
    } finally {
      setLoadingStore(false);
    }
  }, []);

  useEffect(() => {
    loadStore();
  }, [loadStore]);

  const storeIncomplete = !loadingStore && isStoreIncomplete(store);

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <StoreSidebar
        collapsed={collapsed}
        onToggleCollapse={setCollapsed}
        session={session}
        activeView={view}
        onViewChange={setView}
        storeIncomplete={storeIncomplete}
      />
      <StoreMobileSidebar
        session={session}
        activeView={view}
        onViewChange={setView}
        storeIncomplete={storeIncomplete}
      />
      <main
        className={`flex-1 p-8 transition-all duration-300 ${collapsed ? "lg:ml-20" : "lg:ml-64"}`}
      >
        <div className="max-w-7xl mx-auto">
          <StorePageContent
            view={view}
            setView={setView}
            store={store}
            onStoreSaved={(s) => setStore(s)}
          />
        </div>
      </main>
    </div>
  );
}
