// app/middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const role = token?.role;
    const status = token?.status;

    // 🔒 Admin-only area
    if (path.startsWith("/admin")) {
      if (role !== "ADMIN") {
        return NextResponse.redirect(new URL("/denied", req.url));
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
      if (role !== "CUSTOMER" && status !== "ACTIVE") {
        return NextResponse.redirect(new URL("/denied", req.url));
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
