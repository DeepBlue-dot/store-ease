"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  // Map NextAuth error codes to user-friendly messages
  const errorMessages: Record<string, string> = {
    OAuthSignin: "Error while trying to sign in. Please try again.",
    OAuthCallback: "Something went wrong during login. Please retry.",
    OAuthCreateAccount:
      "Could not create your account. Please contact support.",
    EmailCreateAccount: "We could not send a login email. Try again later.",
    Callback: "Authentication callback failed. Please try again.",
    OAuthAccountNotLinked:
      "This email is already linked with another login provider. Try a different method.",
    EmailSignin: "Error sending the sign-in email. Please try again.",
    CredentialsSignin: "Invalid credentials. Please check your details.",
    SessionRequired: "You must be signed in to view this page.",
    AccountDisabled:
      "Your account has been disabled. Contact support for help.",
    AccessDenied: "You do not have permission to access this page.",
    default: "Something went wrong. Please try again.",
  };

  const message = error
    ? errorMessages[error] ?? errorMessages.default
    : errorMessages.default;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="p-6 bg-white shadow rounded max-w-md text-center">
        <h1 className="text-xl font-semibold text-red-600">
          Authentication Error
        </h1>
        <p className="mt-2 text-gray-700">{message}</p>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<p>Loading error details...</p>}>
      <ErrorContent />
    </Suspense>
  );
}
