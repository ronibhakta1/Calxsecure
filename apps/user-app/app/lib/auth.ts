import db from "@repo/db/client";
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcrypt";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      number?: string; // 🚨 LINE 1: ADD THIS!
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    number?: string; // 🚨 LINE 2: ADD THIS!
  }
}

export const authOptions = {
    providers: [
      CredentialsProvider({
          name: 'Credentials',
          credentials: {
            name:{label:"Name", type: "text", placeholder: "Nasir nadaf", required: false},
            phone: { label: "Phone number", type: "text", placeholder: "1234567890", required: true },
            password: { label: "Password", type: "password", required: true },
          },
          async authorize(credentials: any) {
            const hashedPassword = await bcrypt.hash(credentials.password, 10);
            const existingUser = await db.user.findFirst({
                where: {
                    number: credentials.phone
                }
            });

            if (existingUser) {
                const passwordValidation = await bcrypt.compare(credentials.password, existingUser.password);
                if (passwordValidation) {
                    return {
                        id: existingUser.id.toString(),
                        name: existingUser.name,
                        number: existingUser.number, // 🚨 LINE 3: ADD THIS!
                        email: existingUser.number
                    }
                }
                return null;
            }

            try {
                const generatedPin = Math.floor(100000 + Math.random() * 900000).toString();
                const user = await db.user.create({
                    data: {
                        number: credentials.phone,
                        password: hashedPassword,
                        userpin: generatedPin
                    }
                });
            
                return {
                    id: user.id.toString(),
                    name: user.name,
                    number: user.number, // 🚨 LINE 4: ADD THIS!
                    email: user.number
                }
            } catch(e) {
                console.error(e);
            }

            return null
          },
        })
    ],
    secret: process.env.JWT_SECRET || "secret",
    callbacks: {
        async session({ session, token }: { session: Session; token: JWT }) {
          if (session.user && token.sub) {
            session.user.id = token.sub;
            session.user.number = token.number; // 🚨 LINE 5: ADD THIS!
          }
          return session;
        },
        async jwt({ token, user }: { token: JWT; user?: { number?: string } | undefined }) {
          if (user) {
            token.number = user.number;
          }
          return token;
        }
    },
    pages: {
        signIn: '/auth/signin',
        signUp: '/auth/signup',
    },
}