// app/layout.tsx
import type { Metadata } from "next";


export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="p-4 bg-blue-600 text-white">
        <h1>My App Header</h1>
      </header>
      <main className="p-6">{children}</main>
      <footer className="p-4 bg-gray-800 text-white">Footer</footer>
    </>
  );
}
