import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

export default function UserCard({ user }: { user: any }) {
  const initial = user?.name?.charAt(0).toUpperCase() || "?";

  return (
    <Card className="rounded-2xl shadow-md border border-gray-200 ">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">My Profile</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center ">
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name || "User"}
            width={96}
            height={96}
            className="rounded-full border border-gray-300 object-cover"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold">
            {initial}
          </div>
        )}

        <div className="text-center space-y-1">
          <p className="font-semibold text-gray-900">{user.name}</p>
          <p className="text-sm text-gray-600">{user.email}</p>
          <p className="text-sm text-gray-600">
            {user.phone || <span className="italic text-gray-400">No phone</span>}
          </p>
          <p className="text-sm text-gray-600">
            {user.address || <span className="italic text-gray-400">No address</span>}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
