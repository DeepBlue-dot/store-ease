"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-blue-600">
          StoreEase
        </Link>

        {/* Links */}
        <div className="flex gap-6 text-gray-700">
          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>
          <Link href="/orders" className="hover:text-blue-600">
            Orders
          </Link>
          <Link href="/checkout" className="hover:text-blue-600">
            CheckOut
          </Link>
          <Link href="/cart" className="hover:text-blue-600">
            Cart
          </Link>
          <Link href="/profile" className="hover:text-blue-600">
            Profile
          </Link>
           <Link href="/shop" className="hover:text-blue-600">
            Shope
          </Link>
        </div>
      </div>
    </nav>
  );
}
