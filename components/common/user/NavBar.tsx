"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingCart,
  User,
  Package,
  Home,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";

export function Navbar() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  const [cartCount, setCartCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const isLoggedIn = !!session?.user;

  // Fetch cart count
  useEffect(() => {
    async function fetchCart() {
      if (!isLoggedIn) {
        setCartCount(0);
        return;
      }
      try {
        const res = await fetch("/api/cart");
        if (!res.ok) throw new Error("Failed to fetch cart");
        const data = await res.json();
        const totalItems = data.items?.reduce(
          (sum: number, item: any) => sum + item.qty,
          0
        );
        setCartCount(totalItems || 0);
      } catch (err) {
        console.error("Error fetching cart:", err);
        setCartCount(0);
      }
    }
    fetchCart();
  }, [isLoggedIn]);

  // Fetch products on search (desktop + mobile)
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (!searchQuery) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await axios.get(`/api/products`, {
          params: { search: searchQuery, limit: 5 },
        });
        setSearchResults(res.data.data || []);
      } catch (err) {
        console.error("Search error:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Redirect to shop when Enter is pressed
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim() !== "") {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  // Shared search dropdown component
  const SearchDropdown = () => (
    <>
      {searchQuery && searchResults.length > 0 && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white border rounded-md shadow-lg z-[10001] max-h-60 overflow-y-auto">
          {searchResults.map((product) => (
            <Link
              key={product.id}
              href={`/shop/${product.id}`}
              className="block px-4 py-2 hover:bg-gray-100"
              onClick={() => setSearchQuery("")}
            >
              {product.name} - ${product.price}
            </Link>
          ))}
        </div>
      )}
      {searchQuery && !isSearching && searchResults.length === 0 && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white border rounded-md shadow-lg z-[10001] px-4 py-2 text-gray-500">
          No products found.
        </div>
      )}
    </>
  );

  return (
    <nav className="relative z-[10000] border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <img
              src="/logo.png"
              alt="StoreEase Logo"
              className="h-8 w-8 rounded-lg object-contain"
            />
            <span className="font-bold text-xl">StoreEase</span>
          </Link>

          {/* Desktop search */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-12 pr-4 py-3 w-full text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
            <SearchDropdown />
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/" className="flex items-center space-x-1">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
            </Button>

            <Button variant="ghost" asChild>
              <Link href="/shop" className="flex items-center space-x-1">
                <Package className="h-4 w-4" />
                <span>Shop</span>
              </Link>
            </Button>

            {/* Cart */}
            <Button variant="ghost" asChild>
              <Link
                href="/cart"
                className="relative flex items-center space-x-1"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-primary text-white text-xs px-1.5 py-0.5 rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>
            </Button>

            {isLoggedIn && (
              <Button variant="ghost" asChild>
                <Link href="/orders" className="flex items-center space-x-1">
                  <Package className="h-4 w-4" />
                  <span>Orders</span>
                </Link>
              </Button>
            )}

            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-4 w-4" />
                    <span className="sr-only">Profile menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/api/auth/signout">Logout</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild>
                <Link href="/auth/signin">Login</Link>
              </Button>
            )}
          </div>

          {/* Mobile buttons */}
          <div className="flex md:hidden items-center space-x-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/cart" className="relative flex items-center">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs px-1.5 rounded-full">
                    {cartCount}
                  </span>
                )}
                <span className="sr-only">Cart</span>
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-background relative z-[10001]">
            <div className="px-4 py-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="pl-10 pr-4 py-2 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                />
                <SearchDropdown />
              </div>

              {/* Mobile links */}
              <div className="space-y-2">
                <Button variant="ghost" asChild className="w-full justify-start">
                  <Link href="/" className="flex items-center space-x-2">
                    <Home className="h-4 w-4" />
                    <span>Home</span>
                  </Link>
                </Button>

                <Button variant="ghost" asChild className="w-full justify-start">
                  <Link href="/shop" className="flex items-center space-x-2">
                    <Package className="h-4 w-4" />
                    <span>Shop</span>
                  </Link>
                </Button>

                {isLoggedIn && (
                  <>
                    <Button variant="ghost" asChild className="w-full justify-start">
                      <Link href="/orders" className="flex items-center space-x-2">
                        <Package className="h-4 w-4" />
                        <span>Orders</span>
                      </Link>
                    </Button>

                    <Button variant="ghost" asChild className="w-full justify-start">
                      <Link href="/profile" className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </Button>
                  </>
                )}

                {!isLoggedIn && (
                  <Button asChild className="w-full">
                    <Link href="/auth/signin">Login</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
