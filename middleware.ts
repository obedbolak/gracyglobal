// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";

const PUBLIC_AUTH_PATHS = ["/login", "/register"];

const ROLE_PROTECTED_PATHS: { prefix: string; role: UserRole }[] = [
  { prefix: "/admin", role: UserRole.ADMIN },
  { prefix: "/teacher", role: UserRole.TEACHER },
  { prefix: "/counselor", role: UserRole.COUNSELOR },
];

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // ── Redirect authenticated users away from auth pages ────────────────
    if (token && PUBLIC_AUTH_PATHS.some((p) => path.startsWith(p))) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // ── Role-based route protection ──────────────────────────────────────
    if (token) {
      const roles = token.role as UserRole[];

      for (const { prefix, role } of ROLE_PROTECTED_PATHS) {
        if (path.startsWith(prefix) && !roles.includes(role)) {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // Allow unauthenticated access to public auth pages
        if (PUBLIC_AUTH_PATHS.some((p) => path.startsWith(p))) {
          return true;
        }

        // All other matched routes require a token
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
    "/login",
    "/register",
  ],
};
