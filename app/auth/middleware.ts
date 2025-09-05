import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const role = token?.role;
    const status = token?.status;
    console.log("Middleware token:", token);

    // 🚫 If logged in, block access to signin/register/forgot-password/error
    if (token) {
      if (role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      if (role === "CUSTOMER" && status === "ACTIVE") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: () => true, // allow both guests & logged-in users
    },
  }
);

export const config = {
  matcher: [
    "/auth/signin",
    "/auth/register",
    "/auth/forgot-password",
    "/auth/error",
  ],
};
