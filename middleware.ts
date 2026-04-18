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

      // Non-admin trying to access admin pages
      if (!roles.includes("ADMIN") && path.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      // Non-teacher trying to access teacher pages
      if (!roles.includes("TEACHER") && path.startsWith("/teacher")) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      // Non-counselor trying to access counselor pages
      if (!roles.includes("COUNSELOR") && path.startsWith("/counselor")) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
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
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/counselor/:path*",
    "/teacher/:path*",
  ],
};
