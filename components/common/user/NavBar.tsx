"use client";

import Link from "next/link";
import { useState } from "react";
import { HiMenu, HiX } from "react-icons/hi";
import { signOut } from "next-auth/react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="bg-white shadow sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-bold text-blue-600 hover:scale-105 transition-transform"
        >
          StoreEase
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-6 text-gray-700 font-medium">
          <Link
            href="/"
            className="px-2 py-1 rounded hover:bg-blue-50 hover:text-blue-600 transition"
          >
            Home
          </Link>
          <Link
            href="/shop"
            className="px-2 py-1 rounded hover:bg-blue-50 hover:text-blue-600 transition"
          >
            Shop
          </Link>
          <Link
            href="/orders"
            className="px-2 py-1 rounded hover:bg-blue-50 hover:text-blue-600 transition"
          >
            Orders
          </Link>
          <Link
            href="/checkout"
            className="px-2 py-1 rounded hover:bg-blue-50 hover:text-blue-600 transition"
          >
            Checkout
          </Link>
          <Link
            href="/cart"
            className="px-2 py-1 rounded hover:bg-blue-50 hover:text-blue-600 transition"
          >
            Cart
          </Link>
          <Link
            href="/profile"
            className="px-2 py-1 rounded hover:bg-blue-50 hover:text-blue-600 transition"
          >
            Profile
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-4 py-3 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="text-gray-700 hover:text-blue-600 focus:outline-none"
          >
            {isOpen ? <HiX size={28} /> : <HiMenu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg border-t border-gray-200">
          <div className="flex flex-col px-6 py-4 gap-2">
            <Link
              href="/"
              className="px-2 py-2 rounded hover:bg-blue-50 hover:text-blue-600 transition"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/shop"
              className="px-2 py-2 rounded hover:bg-blue-50 hover:text-blue-600 transition"
              onClick={() => setIsOpen(false)}
            >
              Shop
            </Link>
            <Link
              href="/orders"
              className="px-2 py-2 rounded hover:bg-blue-50 hover:text-blue-600 transition"
              onClick={() => setIsOpen(false)}
            >
              Orders
            </Link>
            <Link
              href="/checkout"
              className="px-2 py-2 rounded hover:bg-blue-50 hover:text-blue-600 transition"
              onClick={() => setIsOpen(false)}
            >
              Checkout
            </Link>
            <Link
              href="/cart"
              className="px-2 py-2 rounded hover:bg-blue-50 hover:text-blue-600 transition"
              onClick={() => setIsOpen(false)}
            >
              Cart
            </Link>
            <Link
              href="/profile"
              className="px-2 py-2 rounded hover:bg-blue-50 hover:text-blue-600 transition"
              onClick={() => setIsOpen(false)}
            >
              Profile
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-3 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
