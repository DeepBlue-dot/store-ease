import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { getSession } from "next-auth/react";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      httpOptions: {
        timeout: 20000,
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "jsmith@example.com",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Your password",
        },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },

  callbacks: {
    async signIn({ user, account }) {
      if (!user?.email) return false;

      // 🔎 Find existing user by email
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (!dbUser) {
        // No user with this email → allow NextAuth to create new user
        return true;
      }

      // 🔒 Check status before allowing login
      if (dbUser.status !== "ACTIVE") {
        console.log("Blocked login: user status =", dbUser.status);
        return false;
      }

      // 🔗 If OAuth provider is used, link it to the existing user
      if (account && account.provider !== "credentials") {
        await prisma.account.upsert({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          },
          update: {},
          create: {
            userId: dbUser.id,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            access_token: account.access_token,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
          },
        });
      }

      return true; // ✅ allow login
    },

    async jwt({ token, user }) {
      // When user first logs in
      if (user) {
        token.role = user.role;
        token.status = user.status;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.sub as string;
        session.user.status = token.status as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/auth/register",
  },
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
};
