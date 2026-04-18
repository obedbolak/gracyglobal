// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // ✅ Only update session once per day
  },

  // ✅ Explicit cookie config for persistence
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60, // 30 days - matches session maxAge
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

        // ✅ Select only what you need
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
          role: user.role, // UserRole[] from Prisma
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      // ✅ Ensure Google users get default role
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: [UserRole.USER], // ✅ Default role for Google OAuth
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // ── First sign-in: attach user data to token ──────────────────────
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.picture = user.image;
        token.role = (user as any).role ?? [UserRole.USER];
        token.rolesFetchedAt = Date.now(); // ✅ Track when we last fetched
      }

      // ── Manual session update triggered (e.g. after role change) ──────
      // Call: update() from useSession() to trigger this
      if (trigger === "update" && session?.role) {
        token.role = session.role;
        token.rolesFetchedAt = Date.now();
      }

      // ── Refresh roles from DB every 1 hour only ────────────────────────
      // ✅ NOT on every request — this was your main performance issue
      const ONE_HOUR = 60 * 60 * 1000;
      const lastFetched = (token.rolesFetchedAt as number) ?? 0;
      const shouldRefresh = Date.now() - lastFetched > ONE_HOUR;

      if (token.id && shouldRefresh) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: {
              role: true,
              name: true,
              image: true,
              email: true,
            },
          });

          if (dbUser) {
            token.role = dbUser.role;
            token.name = dbUser.name;
            token.picture = dbUser.image;
            token.email = dbUser.email;
            token.rolesFetchedAt = Date.now();
          }
        } catch (error) {
          // ✅ Don't crash if DB is unreachable — use cached token data
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
    // ✅ Clean up expired sessions from DB (for OAuth users)
    async signOut({ token }) {
      if (token?.id) {
        // Optional: log signout or clear any server-side cache
        console.log(`[Auth] User signed out: ${token.id}`);
      }
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
