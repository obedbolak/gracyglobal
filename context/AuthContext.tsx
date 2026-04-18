// context/AuthContext.tsx
"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";
import { UserRole } from "@prisma/client";

// ── Types ────────────────────────────────────────────────────────────────────

interface AuthContextType {
  session: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
  isAuthenticated: boolean;
  isLoading: boolean;
  user: Session["user"] | null;

  // Role helpers
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  hasAllRoles: (roles: UserRole[]) => boolean;
  isAdmin: boolean;
  isTeacher: boolean;
  isCounselor: boolean;

  // Session control
  refreshSession: (data?: any) => Promise<Session | null>;
}

// ── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status, update } = useSession();

  const userRoles: UserRole[] = useMemo(() => {
    if (!session?.user?.role) return [];
    return Array.isArray(session.user.role)
      ? session.user.role
      : [session.user.role];
  }, [session?.user?.role]);

  // ── Role helpers ───────────────────────────────────────────────────────

  const hasRole = useCallback(
    (role: UserRole): boolean => userRoles.includes(role),
    [userRoles],
  );

  const hasAnyRole = useCallback(
    (roles: UserRole[]): boolean => roles.some((r) => userRoles.includes(r)),
    [userRoles],
  );

  const hasAllRoles = useCallback(
    (roles: UserRole[]): boolean => roles.every((r) => userRoles.includes(r)),
    [userRoles],
  );

  // ── Session refresh ────────────────────────────────────────────────────
  // Call this after a role change on the server to force a token refresh.
  // Under the hood this triggers trigger === "update" in your jwt callback.

  const refreshSession = useCallback(
    async (data?: any): Promise<Session | null> => {
      return await update(data);
    },
    [update],
  );

  // ── Memoized context value ─────────────────────────────────────────────

  const value = useMemo<AuthContextType>(
    () => ({
      session: session ?? null,
      status,
      isAuthenticated: status === "authenticated",
      isLoading: status === "loading",
      user: session?.user ?? null,

      hasRole,
      hasAnyRole,
      hasAllRoles,
      isAdmin: userRoles.includes(UserRole.ADMIN),
      isTeacher: userRoles.includes(UserRole.TEACHER),
      isCounselor: userRoles.includes(UserRole.COUNSELOR),

      refreshSession,
    }),
    [
      session,
      status,
      userRoles,
      hasRole,
      hasAnyRole,
      hasAllRoles,
      refreshSession,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
