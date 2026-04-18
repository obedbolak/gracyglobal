// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";
import { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole[];
      name: string | null;
      email: string;
      image: string | null | undefined;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: UserRole[];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: UserRole[];
    rolesFetchedAt?: number;
    name?: string | null;
    email?: string;
    picture?: string | null;
  }
}
