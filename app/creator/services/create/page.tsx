// app/creator/services/create/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CreatorServiceForm from "@/components/creator/creatorServiceForm";

const CREATOR_PLANS = ["growth", "elite", "elite / pro", "elite/pro"];

export default async function CreatorServiceCreatePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/creator/services/create");
  }

  // ✅ findFirst because userId is not unique alone (@@unique is [userId, planId])
  const subscription = await prisma.userSubscription.findFirst({
    where: {
      userId: session.user.id,
      status: "ACTIVE",
    },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });

  const hasAccess =
    subscription &&
    CREATOR_PLANS.includes(subscription.plan.name.toLowerCase());

  if (!hasAccess) {
    redirect("/plans?reason=creator");
  }

  return <CreatorServiceForm />;
}
