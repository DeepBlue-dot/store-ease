import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

// Export handler as GET and POST for App Router
export { handler as GET, handler as POST };
