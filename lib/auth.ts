// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

const isProduction = process.env.NODE_ENV === "production";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 5 * 60, // Update session every 5 minutes instead of 24 hours
  },

  // FIX: cookie name must match what NextAuth expects per environment.
  // In production with secure:true, the __Secure- prefix is required.
  // Hardcoding "next-auth.session-token" in production means middleware
  // looks for __Secure-next-auth.session-token but finds nothing → loop.
  cookies: {
    sessionToken: {
      name: isProduction
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            password: true,
            role: true,
          },
        });

        if (!user || !user.password) {
          throw new Error("No account found with this email");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isValid) {
          throw new Error("Incorrect password");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: [UserRole.USER],
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      const justSignedIn = !!user;

      // ── First sign-in: attach user data to token ──────────────────────
      if (justSignedIn) {
        token.id = user.id;
        token.name = user.name;
        token.picture = user.image;
        token.role = (user as any).role?.length
          ? (user as any).role
          : [UserRole.USER];
        token.rolesFetchedAt = Date.now();
      }

      // ── Manual session update (e.g. after role change) ────────────────
      if (trigger === "update") {
        // Always refresh roles from DB on manual update
        if (token.id) {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { id: token.id as string },
              select: { role: true, name: true, image: true, email: true },
            });

            if (dbUser) {
              token.role = dbUser.role?.length ? dbUser.role : [UserRole.USER];
              token.name = dbUser.name;
              token.picture = dbUser.image;
              token.email = dbUser.email;
              token.rolesFetchedAt = Date.now();
            }
          } catch (error) {
            console.error(
              "[JWT] Failed to refresh user from DB on update:",
              error,
            );
          }
        }

        // If session.role is provided, use it
        if (session?.role) {
          token.role = session.role;
        }
      }

      // ── Refresh roles from DB every 1 hour ────────────────────────────
      const ONE_HOUR = 60 * 60 * 1000;
      const lastFetched = (token.rolesFetchedAt as number) ?? 0;
      const shouldRefresh = Date.now() - lastFetched > ONE_HOUR;

      if (token.id && shouldRefresh && !justSignedIn) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { role: true, name: true, image: true, email: true },
          });

          if (dbUser) {
            token.role = dbUser.role?.length ? dbUser.role : [UserRole.USER];
            token.name = dbUser.name;
            token.picture = dbUser.image;
            token.email = dbUser.email;
            token.rolesFetchedAt = Date.now();
          }
        } catch (error) {
          console.error("[JWT] Failed to refresh user from DB:", error);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole[];
        session.user.name = token.name ?? null;
        session.user.email = token.email as string;
        session.user.image = token.picture as string | null | undefined;
      }
      return session;
    },
  },

  events: {
    async signOut({ token }) {
      if (token?.id) {
        console.log(`[Auth] User signed out: ${token.id}`);
      }
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: !isProduction,
};
