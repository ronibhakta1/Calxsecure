
import db from "@repo/db/client";
import type { Account, Profile, User } from "next-auth";
import type { AdapterUser } from "next-auth/adapters";
import GitHubProvider from "next-auth/providers/github";

export const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || ""
    })
  ],
  callbacks: {
    async signIn({
      user,
      account,
    }: {
      user: User | AdapterUser;
      account: Account | null;
      profile?: Profile;
      email?: { verificationRequest?: boolean };
      credentials?: Record<string, unknown>;
    }) {
      console.log("hi signin");
      if (!user || !user.email) {
        return false;
      }

      await db.merchant.upsert({
        select: {
          id: true
        },
        where: {
          email: user.email
        },
        create: {
          email: user.email || "visible@gmail.com",
          name: user.name || "Visible",
          auth_type: account?.provider === "github" ? "Github" : "Github",
        },
        update: {
          name: user.name || "Visible",
          auth_type: account?.provider === "github" ? "Github" : "Github" // Use a prisma type here
        }
      });

      return true;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "secret"
};