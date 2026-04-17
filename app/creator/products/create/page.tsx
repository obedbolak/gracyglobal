// app/creator/products/create/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import CreatorProductForm from "@/components/creator/creatorProductForm";

// Plans that unlock creator tools
const CREATOR_PLANS = ["growth", "elite", "elite / pro", "elite/pro"];

export default async function CreatorProductCreatePage() {
  const session = await getServerSession(authOptions);

  // Must be logged in
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/creator/products/create");
  }

  // Check subscription
  const subscription = await prisma.userSubscription.findFirst({
    where: {
      userId: session.user.id,
      status: "ACTIVE",
    },
    include: { plan: true },
    orderBy: { createdAt: "desc" }, // get the most recent if multiple
  });

  const hasAccess =
    subscription?.status === "ACTIVE" &&
    CREATOR_PLANS.includes(subscription.plan.name.toLowerCase());

  if (!hasAccess) {
    redirect("/plans?reason=creator");
  }

  return <CreatorProductForm />;
}
