"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import UserCard from "@/components/profile/UserCard";
import PasswordForm from "@/components/profile/PasswordForm";
import ProfileForm from "@/components/profile/ProfileForm";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/users/me")
      .then((res) => setUser(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center">Loading...</p>;
  if (!user) return <p className="text-center text-red-500">Failed to load user</p>;

  return (
    <div className="container mx-auto py-8 space-y-10 max-w-5xl">
      {/* 🪪 Profile section pinned on top */}
      <UserCard user={user} />

      {/* Forms side by side (stack on mobile) */}
      <div className="grid  md:grid-cols-2">
  
          <ProfileForm user={user} onUpdate={setUser} />
          <PasswordForm />
      </div>

      {/* Logout button */}
      <div className="flex justify-end">
        <Button variant="destructive" onClick={() => signOut()}>
          Logout
        </Button>
      </div>
    </div>
  );
}
