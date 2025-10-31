import db from "@repo/db/client";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import type { AuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { Session, User } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    name?: string | null;
    number?: string;
    sessionToken?: string;
  }

  interface Session {
    user: {
      id?: string;
      name?: string | null;
      number?: string;
      sessionToken?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    number?: string;
    sessionToken?: string;
  }
}

async function createNewSessionToken(userId: number) {
  const newToken = uuid();
  await db.user.update({
    where: { id: userId },
    data: { sessionToken: newToken },
  });
  return newToken;
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        phone: { label: "Phone", type: "text", required: true },
        password: { label: "Password", type: "password", required: true },
      },

      async authorize(credentials) {
        const { phone, password } = credentials as any;

        const user = await db.user.findUnique({
          where: { number: phone },
        });
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return null;

        const sessionToken = await createNewSessionToken(user.id);

        return {
          id: user.id.toString(),
          name: user.name,
          number: user.number,
          sessionToken,
        };
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.number = user.number;
        token.sessionToken = user.sessionToken;
      }

      if (token.number && token.sessionToken) {
        const dbUser = await db.user.findUnique({
          where: { number: token.number },
          select: { sessionToken: true },
        });

        if (!dbUser || dbUser.sessionToken !== token.sessionToken) {
          throw new Error("SESSION_EXPIRED_ANOTHER_DEVICE");
        }
      }

      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      if (token.sub) session.user.id = token.sub;
      if (token.number) session.user.number = token.number;
      if (token.sessionToken) session.user.sessionToken = token.sessionToken;
      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
  },
};