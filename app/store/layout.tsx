import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import StoreShell from "@/components/store/StoreShell";

export const metadata = { title: "My Store | GracyGlobal" };

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/store");

  const roles = Array.isArray(session.user.role) ? session.user.role : [session.user.role];
  if (!roles.includes("CREATOR") && !roles.includes("MARKETPLACE") && !roles.includes("ADMIN")) {
    redirect("/dashboard");
  }

  return <StoreShell session={session} />;
}
