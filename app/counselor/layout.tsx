import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import CounselorShell from "@/components/counselor/CounselorShell";
import { hasRole } from "@/lib/roleHelpers";

export default async function CounselorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/counselor");
  }

  if (!hasRole(session.user.role, "COUNSELOR")) {
    redirect("/dashboard");
  }

  return <CounselorShell session={session}>{children}</CounselorShell>;
}
