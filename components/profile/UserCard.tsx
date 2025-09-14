import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

function UserCard({ user }: { user: any }) {
  const initial = user?.name?.charAt(0).toUpperCase() || "?"

  return (
    <Card className="rounded-3xl shadow-lg border-0 bg-gradient-to-br from-slate-50 to-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-slate-900">My Profile</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6">
        {user.image ? (
          <Image
            src={user.image || "/placeholder.svg"}
            alt={user.name || "User"}
            width={120}
            height={120}
            className="rounded-full border-4 border-white shadow-xl object-cover"
          />
        ) : (
          <div className="w-30 h-30 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center text-4xl font-bold shadow-xl">
            {initial}
          </div>
        )}

        <div className="text-center space-y-3">
          <h3 className="text-xl font-bold text-slate-900">{user.name}</h3>
          <div className="space-y-2">
            <p className="text-slate-600 flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              {user.email}
            </p>
            <p className="text-slate-600 flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              {user.phone || <span className="italic text-slate-400">No phone</span>}
            </p>
            <p className="text-slate-600 flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              {user.address || <span className="italic text-slate-400">No address</span>}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default UserCard
