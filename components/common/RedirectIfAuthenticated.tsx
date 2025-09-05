// components/RedirectIfAuthenticated.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth"; // your NextAuth config

export default async function RedirectIfAuthenticated() {
  const session = await getServerSession(authOptions);

  if (session) {
    const role = session.user?.role;
    const accountStatus = session.user?.status;

    if (role === "ADMIN") {
      redirect("/admin");
    } else if (role === "CUSTOMER" && accountStatus === "ACTIVE") {
      redirect("/");
    } else {
      redirect("/auth/error?error=AccountDisabled");
    }
  }

  return null; // nothing to render if no redirect
}
