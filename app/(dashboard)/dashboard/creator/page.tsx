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
    ? (await prisma.product.findMany({
        where: { sellerId: session.user.id },
        orderBy: { createdAt: "desc" },
        include: { category: true },
      }))?.map((product) => ({
        ...product,
        category: product.category.name,
      }))
    : [];

  // Fetch their services if subscribed to service plan
  const services = hasServiceSub
    ? (await prisma.service.findMany({
        where: { sellerId: session.user.id },
        orderBy: { createdAt: "desc" },
        include: { category: true },
      }))?.map((service) => ({
        ...service,
        category: service.category.name,
      }))
    : [];

  return (
    <MyStoreClient
      hasMarketplaceSub={hasMarketplaceSub}
      hasServiceSub={hasServiceSub}
      products={products}
      services={services}
    />
  );
}
