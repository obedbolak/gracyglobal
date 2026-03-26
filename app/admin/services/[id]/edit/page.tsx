// app/admin/services/[id]/edit/page.tsx

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditServiceForm from "@/components/admin/EditServiceForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditServicePage({ params }: PageProps) {
  const { id } = await params;

  const service = await prisma.product.findUnique({
    where: { id },
  });

  if (!service) {
    notFound();
  }

  return <EditServiceForm service={service} />;
}
