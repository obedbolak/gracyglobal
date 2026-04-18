"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/context/ThemeContext";
import { CartProvider } from "@/context/CartContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { AuthProvider } from "@/context/AuthContext";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { CommunityMembershipProvider } from "@/context/CommunityMembershipContext";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider
      refetchInterval={5 * 60} // re-check session every 5 min
      refetchOnWindowFocus={false} // don't refetch just because user switched tabs
    >
      <AuthProvider>
        <CommunityMembershipProvider>
          <SubscriptionProvider>
            <ThemeProvider defaultTheme="light" storageKey="gracyglobal-theme">
              <CurrencyProvider>
                <CartProvider>{children}</CartProvider>
              </CurrencyProvider>
            </ThemeProvider>
          </SubscriptionProvider>
        </CommunityMembershipProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
