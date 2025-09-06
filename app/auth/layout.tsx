import Image from "next/image";
import Link from "next/link";
import { Home } from "lucide-react"; // Make sure lucide-react is installed
import { Button } from "@/components/ui/button";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1fr_2fr] relative">
      {/* Home link */}
      <div className="absolute top-6 left-6">
        <Link href="/">
          <Button variant="ghost" className="flex items-center gap-2 px-3 py-2">
            <Home className="w-4 h-4" />
            Home
          </Button>
        </Link>
      </div>

      {/* Left side (Logo + Description) */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-blue-600 text-white">
        <div className="flex flex-col items-center text-center ">
          {/* Logo */}
          <Image
            src="/logo.png" // replace with your logo path
            alt="App Logo"
            width={80}
            height={80}
            className="mb-6"
          />

          {/* Title */}
          <h2 className="text-3xl font-bold mb-3">Welcome to StoreEase</h2>

          {/* Small description */}
          <p className="text-blue-100 text-lg">
            A modern e-commerce platform for seamless shopping.
          </p>
        </div>
      </div>

      {/* Right side (Auth Form) */}
      <div className="flex items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
