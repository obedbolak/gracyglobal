// app/(dashboard)/dashboard/services/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MyStoreClient from "@/components/dashboard/MyStoreClient";

export const metadata = { title: "My Services | GracyGlobal" };

export default async function MyServicesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const subscriptions = await prisma.userSubscription.findMany({
    where: { userId: session.user.id, status: { in: ["ACTIVE", "TRIALING"] } },
    include: { plan: true },
  });

  const hasMarketplaceSub = subscriptions.some(
    (s) => s.plan.category === "MARKETPLACE",
  );
  const hasServiceSub = subscriptions.some(
    (s) => s.plan.category === "SERVICE",
  );

  const services = hasServiceSub
    ? (
        await prisma.service.findMany({
          where: { sellerId: session.user.id },
          orderBy: { createdAt: "desc" },
          include: { category: true },
        })
      ).map((s) => ({ ...s, category: s.category.name }))
    : [];

  return (
    <MyStoreClient
      hasMarketplaceSub={hasMarketplaceSub}
      hasServiceSub={hasServiceSub}
      products={[]}
      services={services}
      defaultTab="services"
    />
  );
}
