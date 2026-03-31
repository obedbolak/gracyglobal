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

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
    include: { plan: true },
  });

  const hasAccess =
    subscription?.status === "ACTIVE" &&
    CREATOR_PLANS.includes(subscription.plan.name.toLowerCase());

  if (!hasAccess) {
    redirect("/plans?reason=creator");
  }

  return <CreatorServiceForm />;
}
