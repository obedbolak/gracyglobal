import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireUser } from "@/lib/api";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireUser();
  if (!user) return err("Unauthorized", 401);

  const { id } = await params; // ✅ await params

  const paymentMethod = await prisma.userPaymentMethod.findUnique({
    where: { id },
  });

  if (!paymentMethod || paymentMethod.userId !== user.id) {
    return err("Payment method not found", 404);
  }

  await prisma.userPaymentMethod.delete({ where: { id } });
  return ok({ id });
}
