import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditUserForm from "@/components/admin/EditUserForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditUserPage({ params }: PageProps) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      counselorProfile: {
        select: { id: true, specialty: true, verified: true },
      },
      _count: {
        select: {
          bookings: true,
          orders: true,
          communityPosts: true,
          teacherCourses: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  return <EditUserForm user={user} />;
}
