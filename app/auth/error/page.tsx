"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="p-6 bg-white shadow rounded">
        <h1 className="text-xl font-semibold">Authentication Error</h1>
        <p className="mt-2 text-gray-700">
          {error ? `Error: ${error}` : "Something went wrong."}
        </p>
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
