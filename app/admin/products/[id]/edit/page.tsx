// app/admin/products/[id]/edit/page.tsx

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditProductForm from "@/components/admin/EditProductForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    notFound();
  }

  return <EditProductForm product={product} />;
}
