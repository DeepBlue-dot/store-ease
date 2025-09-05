import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const adminPath = "/admin";
const customerPaths = [
  "/cart",
  "/checkout",
  "/orders",
  "/profile",
  "/ratings",
];

// Role-based landing pages
const roleRedirects: Record<string, string> = {
  ADMIN: "/admin",
  CUSTOMER: "/profile",
};

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const role = token?.role;
    const status = token?.status;

    // If user is authenticated and hits /auth/signin, redirect to their dashboard
    if (path === "/auth/signin" && role && roleRedirects[role]) {
      return NextResponse.redirect(new URL(roleRedirects[role], req.url));
    }

    // 🔒 Admin-only area
    if (path.startsWith(adminPath)) {
      if (role !== "ADMIN") {
        return NextResponse.redirect(
          new URL(`/auth/signin?callbackUrl=${encodeURIComponent(req.url)}`, req.url)
        );
      }
    }

    // 👤 Customer-only area (excluding /auth)
    if (
      customerPaths.some(p => path.startsWith(p)) &&
      !path.startsWith("/auth")
    ) {
      if (role !== "CUSTOMER") {
        return NextResponse.redirect(
          new URL("/auth/error?error=AccessDenied", req.url)
        );
      }
      if (status !== "ACTIVE") {
        return NextResponse.redirect(
          new URL("/auth/error?error=AccountDisabled", req.url)
        );
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Only protect certain paths
        const protectedPaths = [adminPath, ...customerPaths];
        const isProtected = protectedPaths.some(path =>
          req.nextUrl.pathname.startsWith(path)
        );
        // Allow access to /auth/signin for unauthenticated users
        if (req.nextUrl.pathname === "/auth/signin") return true;
        return !isProtected || !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/:path*"],
};