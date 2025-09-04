import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center text-center">
      <h1 className="text-8xl font-extrabold text-blue-600 drop-shadow-sm">404</h1>
      <h2 className="mt-4 text-2xl font-semibold text-gray-800">
        Page not found
      </h2>
      <p className="mt-2 max-w-md text-gray-600">
        Sorry, the page you’re looking for doesn’t exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 text-white font-medium shadow hover:scale-105 hover:bg-blue-700 transition-transform duration-200"
      >
        Go back home
      </Link>
    </div>
  );
}
