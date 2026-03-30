// middleware.ts

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Role-based redirects
    if (token) {
      const role = token.role as string | string[];
      const roles = Array.isArray(role) ? role : [role];

      // Admin trying to access non-admin pages
      if (
        roles.includes("ADMIN") &&
        path.startsWith("/dashboard") &&
        !path.startsWith("/admin")
      ) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }

      // Non-admin trying to access admin pages
      if (!roles.includes("ADMIN") && path.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      // Counselor-specific routes (optional)
      if (roles.includes("COUNSELOR") && path === "/dashboard") {
        return NextResponse.redirect(new URL("/counselor/dashboard", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
);

// Protect these routes
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/counselor/:path*"],
};
