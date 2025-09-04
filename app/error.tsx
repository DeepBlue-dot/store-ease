"use client" // error.tsx must be a client component

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body className="flex h-screen flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-red-500">{error.message}</p>
        <button
          onClick={() => reset()}
          className="mt-4 rounded bg-blue-500 px-4 py-2 text-white"
        >
          Try again
        </button>
      </body>
    </html>
  )
}
