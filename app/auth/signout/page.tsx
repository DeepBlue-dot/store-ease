"use client";

import { signOut } from "next-auth/react";
import { useEffect } from "react";
import Link from "next/link";

export default function SignOutPage() {
  // Auto sign out when page loads
  useEffect(() => {
    signOut({ callbackUrl: "/" });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6">
      <div className="bg-white shadow-md rounded-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Signing you out...
        </h1>
        <p className="text-gray-600 mb-6">
          Please wait while we securely log you out.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
}
