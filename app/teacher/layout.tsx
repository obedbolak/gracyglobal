import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import TeacherShell from "@/components/teacher/TeacherShell";
import { hasRole } from "@/lib/roleHelpers";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/teacher");
  }

  if (!hasRole(session.user.role, "TEACHER")) {
    redirect("/dashboard");
  }

  return <TeacherShell session={session}>{children}</TeacherShell>;
}
