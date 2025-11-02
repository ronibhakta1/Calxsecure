import db from "@repo/db/client";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      console.log("🔐 SignIn triggered for:", user.email);

      if (!user?.email) return false;

      try {
        await db.merchant.upsert({
          where: { email: user.email },
          update: {
            name: user.name || "Visible",
            auth_type: account?.provider === "github" ? "Github" : "Google",
          },
          create: {
            email: user.email,
            name: user.name || "Visible",
            auth_type: account?.provider === "github" ? "Github" : "Google",
          },
        });

        return true;
      } catch (error) {
        console.error(" Error during merchant upsert:", error);
        return false;
      }
    },
  },

  secret: process.env.NEXTAUTH_SECRET!,
};
