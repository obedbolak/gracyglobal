import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ServicesDashShell from "@/components/services-dashboard/ServicesDashShell";

export default async function ServicesDashLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/services-dashboard");

  const roles = Array.isArray(session.user.role) ? session.user.role : [session.user.role];
  if (!roles.includes("MARKETPLACE") && !roles.includes("CREATOR") && !roles.includes("ADMIN")) {
    redirect("/dashboard");
  }

  return <ServicesDashShell session={session}>{children}</ServicesDashShell>;
}
