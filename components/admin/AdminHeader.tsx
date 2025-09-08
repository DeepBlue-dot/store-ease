import { User } from "next-auth";
import Image from "next/image";

interface AdminHeaderProps {
  user: User;
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const avatarFallback = user.name?.charAt(0).toUpperCase() || "?";

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-3 gap-3">
        {/* Greeting */}
        <div className="flex flex-col">
          <h2 className="text-lg sm:text-2xl font-semibold text-gray-900">
            Welcome back, {user.name}!
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">Admin Dashboard</p>
        </div>

        {/* User Info */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Hide text on small screens */}
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-600 truncate max-w-[150px]">
              {user.email}
            </p>
          </div>

          {/* Avatar */}
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name || "User"}
              width={40}
              height={40}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-gray-300 object-cover"
            />
          ) : (
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {avatarFallback}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
