"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tags,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Categories", href: "/admin/categories", icon: Tags },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Customers", href: "/admin/users", icon: Users },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <TooltipProvider>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:static z-50 h-screen bg-gray-900 text-white flex flex-col transition-all duration-300 
        ${collapsed ? "w-20" : "w-64"} ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Logo + Collapse Toggle */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
          {!collapsed && <h1 className="text-lg font-bold">StoreEase Admin</h1>}
          <button
            className="p-2 text-gray-400 hover:text-white md:inline-flex hidden"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
          {/* Mobile menu toggle */}
          <button
            className="p-2 text-gray-400 hover:text-white md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-6 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const linkContent = (
              <div
                className={`flex items-center px-4 py-3 rounded-lg transition-all border-l-4 ${
                  isActive
                    ? "bg-gray-800 text-white border-blue-500"
                    : "text-gray-300 border-transparent hover:bg-gray-800 hover:text-white"
                }`}
              >
                <item.icon className="w-5 h-5 mr-3 shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </div>
            );

            return collapsed ? (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>
                  <Link href={item.href}>{linkContent}</Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.name}</TooltipContent>
              </Tooltip>
            ) : (
              <Link key={item.name} href={item.href}>
                {linkContent}
              </Link>
            );
          })}
        </nav>

        {/* Sign Out Button */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-4 py-3 text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3 shrink-0" />
            {!collapsed && "Sign Out"}
          </button>
        </div>
      </div>
    </TooltipProvider>
  );
}
