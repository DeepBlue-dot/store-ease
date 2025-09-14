"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import PasswordForm from "@/components/profile/PasswordForm"
import ProfileForm from "@/components/profile/ProfileForm"
import UserCard from "@/components/profile/UserCard"


export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios
      .get("/api/users/me")
      .then((res) => setUser(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600">Loading your profile...</p>
        </div>
      </div>
    )

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-center text-red-500 bg-red-50 px-6 py-4 rounded-xl">Failed to load user profile</p>
      </div>
    )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="container mx-auto py-12 space-y-12 max-w-6xl px-4">
        {/* Profile section */}
        <div className="max-w-md mx-auto">
          <UserCard user={user} />
        </div>

        {/* Forms side by side (stack on mobile) */}
        <div className="grid md:grid-cols-2 gap-8">
          <ProfileForm user={user} onUpdate={setUser} />
          <PasswordForm />
        </div>

        {/* Logout button */}
        <div className="flex justify-center">
          <Button
            variant="destructive"
            onClick={() => signOut()}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl px-8 py-3 font-medium shadow-lg"
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}
