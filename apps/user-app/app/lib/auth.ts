import db from "@repo/db/client";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import type { AuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { Session, User } from "next-auth";
import redis from "@/lib/redis";

const SESSION_TTL = 30 * 24 * 60 * 60; // 30 days in seconds

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

      async authorize(
        credentials: { phone: string; password: string } | undefined
      ) {
        const { phone, password } = credentials as {
          phone: string;
          password: string;
        };

        const rateKey = `rate_limit:phone:${phone}`;
        const attempts = await redis.incr(rateKey);
        if (attempts === 1) {
          await redis.expire(rateKey, 60); // 1 minute window
        }
        if (attempts > 5) {
          throw new Error(
            "Too many login attempts. Please try again in 1 minute."
          );
        }

        const user = await db.user.findUnique({
          where: { number: phone },
        });
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
          const remaining = 5 - attempts;
          if (remaining > 0) {
            throw new Error(
              `Invalid credentials. ${remaining} attempt(s) left.`
            );
          } else {
            throw new Error("Too many login attempts. Try again in 1 minute.");
          }
        }
        await redis.del(rateKey); // reset on successful login

        const sessionToken = uuid();
        await db.user.update({
          where: { id: user.id },
          data: { sessionToken },
        });
        await redis.setex(`session:phone:${phone}`, SESSION_TTL, sessionToken);

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

      if (!token.number) return token;

      const cacheKey = `session:phone:${token.number}`;
      const cachedToken = await redis.get(cacheKey);

      if (cachedToken && cachedToken !== token.sessionToken) {
        throw new Error("SESSION_EXPIRED_ANOTHER_DEVICE");
      }

      if (!cachedToken) {
        const dbUser = await db.user.findUnique({
          where: { number: token.number },
          select: { sessionToken: true },
        });

        if (!dbUser) {
          throw new Error("USER_NOT_FOUND");
        }
        // repopulate cache
        await redis.setex(cacheKey, SESSION_TTL, dbUser.sessionToken!);
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
