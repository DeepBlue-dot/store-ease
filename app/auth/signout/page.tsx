"use client";

import { signOut } from "next-auth/react";
import { useEffect } from "react";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SignOutPage() {
  // Auto sign out when page loads
  useEffect(() => {
    signOut({ callbackUrl: "/" });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6">
      <Card className="p-8 shadow-md rounded-lg max-w-md text-center">
        <CardContent className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-800">
            Signing you out...
          </h1>
          <p className="text-gray-600">
            Please wait while we securely log you out.
          </p>
          <Link href="/">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Go to Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
