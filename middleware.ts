// app/middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const role = token?.role;
    const status = token?.status;

    // 🚫 Redirect logged-in users away from *auth* pages (except signout + verify-request)
    if (
      token &&
      (path.startsWith("/auth/signin") ||
        path.startsWith("/auth/register") ||
        path.startsWith("/auth/forgot-password") ||
        path.startsWith("/auth/error"))
    ) {
      if (role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", req.url));
      } else if (role === "CUSTOMER" && status === "ACTIVE") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // 🔒 Admin-only area
    if (path.startsWith("/admin")) {
      if (role !== "ADMIN") {
        return NextResponse.redirect(
          new URL(
            `/auth/signin?callbackUrl=${encodeURIComponent(req.url)}`,
            req.url
          )
        );
      }
    }

    // 👤 Customer-only area
    if (
      path.startsWith("/cart") ||
      path.startsWith("/checkout") ||
      path.startsWith("/orders") ||
      path.startsWith("/profile") ||
      path.startsWith("/ratings")
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
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/cart/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/profile/:path*",
    "/ratings/:path*",
  ],
};
