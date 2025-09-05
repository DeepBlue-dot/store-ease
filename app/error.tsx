"use client";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex h-screen flex-col items-center justify-center text-center bg-gray-50">
      <h1 className="text-3xl font-bold text-red-600">Something went wrong</h1>
      <p className="mt-2 text-gray-700">{error.message}</p>
      <button
        onClick={reset}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Try Again
      </button>
    </div>
  );
}
