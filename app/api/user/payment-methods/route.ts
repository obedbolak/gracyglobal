import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireUser } from "@/lib/api";

const ALLOWED_METHODS = [
  "MOBILE_MONEY_MTN",
  "MOBILE_MONEY_ORANGE",
  "BANK_TRANSFER",
  "CARD",
  "CASH",
] as const;

export async function GET() {
  const user = await requireUser();
  if (!user) return err("Unauthorized", 401);

  const paymentMethods = await prisma.userPaymentMethod.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return ok(paymentMethods);
}

export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (!user) return err("Unauthorized", 401);

  const body = await req.json();
  const { method, label, value } = body;

  if (typeof method !== "string" || !ALLOWED_METHODS.includes(method)) {
    return err("Invalid payment method");
  }

  if (typeof label !== "string" || label.trim().length === 0) {
    return err("Payment method label is required");
  }

  if (typeof value !== "string" || value.trim().length === 0) {
    return err("Payment details are required");
  }

  const existingCount = await prisma.userPaymentMethod.count({
    where: { userId: user.id },
  });

  const paymentMethod = await prisma.userPaymentMethod.create({
    data: {
      userId: user.id,
      method,
      label: label.trim(),
      details: { value: value.trim() },
      isDefault: existingCount === 0,
    },
  });

  return ok(paymentMethod, 201);
}
