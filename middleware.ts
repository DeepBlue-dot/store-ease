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
      && !path.startsWith("/auth")
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
    "/cart/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/profile/:path*",
    "/ratings/:path*",
  ],
};
