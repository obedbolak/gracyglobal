// app/(dashboard)/dashboard/creator/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MyStoreClient from "@/components/dashboard/MyStoreClient";

export const metadata = {
  title: "My Store | GracyGlobal",
};

export default async function CreatorPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  // Fetch all active subscriptions with their plans
  const subscriptions = await prisma.userSubscription.findMany({
    where: {
      userId: session.user.id,
      status: { in: ["ACTIVE", "TRIALING"] },
    },
    include: {
      plan: true,
    },
  });

  const hasMarketplaceSub = subscriptions.some(
    (s) => s.plan.category === "MARKETPLACE",
  );
  const hasServiceSub = subscriptions.some(
    (s) => s.plan.category === "SERVICE",
  );

  // Fetch their products if subscribed to marketplace
  const products = hasMarketplaceSub
    ? await prisma.product.findMany({
        where: { sellerId: session.user.id },
        orderBy: { createdAt: "desc" },
      })
    : [];

  // Fetch their services if subscribed to service plan
  // Note: Service model doesn't have sellerId yet — you may need to add it
  // For now we pass empty array — update when sellerId is added to Service model
  const services: any[] = [];

  return (
    <MyStoreClient
      hasMarketplaceSub={hasMarketplaceSub}
      hasServiceSub={hasServiceSub}
      products={products}
      services={services}
    />
  );
}
