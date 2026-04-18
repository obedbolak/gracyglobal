// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { getRoleHome, hasRole, normalizeRoles } from "@/lib/roleHelpers";

const isProduction = process.env.NODE_ENV === "production";

const PUBLIC_AUTH_PATHS = ["/login", "/register"];

const ROLE_PROTECTED_PATHS = [
  { prefix: "/admin", role: "ADMIN" },
  { prefix: "/teacher", role: "TEACHER" },
  { prefix: "/counselor", role: "COUNSELOR" },
  { prefix: "/volunteer", role: "VOLUNTEER" },
];

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const roles = normalizeRoles(token?.role);

    // ── Logged-in user hits /login or /register ───────────────────────
    if (token && PUBLIC_AUTH_PATHS.some((p) => path.startsWith(p))) {
      const callbackUrl = req.nextUrl.searchParams.get("callbackUrl");
      const destination =
        callbackUrl && !callbackUrl.includes("/login")
          ? callbackUrl
          : getRoleHome(roles);
      return NextResponse.redirect(new URL(destination, req.url));
    }

    // ── Role-based route protection ───────────────────────────────────
    if (token) {
      for (const { prefix, role } of ROLE_PROTECTED_PATHS) {
        if (path.startsWith(prefix) && !hasRole(roles, role)) {
          return NextResponse.redirect(new URL(getRoleHome(roles), req.url));
        }
      }
    }

    return NextResponse.next();
  },
  {
    // FIX: must match the cookie name in auth.ts exactly —
    // otherwise withAuth can't read the token and treats every
    // user as unauthenticated → redirect loop back to /login
    cookies: {
      sessionToken: {
        name: isProduction
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      },
    },
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        if (PUBLIC_AUTH_PATHS.some((p) => path.startsWith(p))) return true;
        if (path.startsWith("/api/auth")) return true;
        return !!token;
      },
    },
  },
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/counselor/:path*",
    "/teacher/:path*",
    "/volunteer/:path*",
    "/login",
    "/register",
  ],
};
