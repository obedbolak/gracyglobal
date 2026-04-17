import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireUser } from "@/lib/api";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = await requireUser();
  if (!user) return err("Unauthorized", 401);

  const paymentMethod = await prisma.userPaymentMethod.findUnique({
    where: { id: params.id },
  });

  if (!paymentMethod || paymentMethod.userId !== user.id) {
    return err("Payment method not found", 404);
  }

  await prisma.userPaymentMethod.delete({ where: { id: params.id } });
  return ok({ id: params.id });
}
