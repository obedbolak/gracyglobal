import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import {
  MapPin,
  Clock,
  Store as StoreIcon,
  Package,
  Star,
  ArrowRight,
} from "lucide-react";

async function getStoreServices(slug: string) {
  const store = await prisma.store.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      businessName: true,
      businessType: true,
      image: true,
      location: true,
      quarter: true,
      openingHours: true,
      description: true,
      phone: true,
      whatsapp: true,
      active: true,
      createdAt: true,
      userId: true,
    },
  });

  if (!store || !store.active) return null;

  const products = await prisma.product.count({
    where: { sellerId: store.userId, active: true },
  });

  const services = await prisma.service.findMany({
    where: { sellerId: store.userId, active: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    include: {
      category: true,
      options: { where: { active: true }, orderBy: { amount: "asc" } },
    },
  });

  return { store, productsCount: products, services };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getStoreServices(slug);
  if (!data) return { title: "Store services not found" };
  return {
    title: `${data.store.businessName} services | GracyGlobal`,
    description: `Browse services from ${data.store.businessName}.`,
    openGraph: {
      title: `${data.store.businessName} services`,
      description: data.store.description ?? undefined,
      images: data.store.image ? [data.store.image] : undefined,
    },
  };
}

function formatCurrency(value: number) {
  return value.toLocaleString("en-US") + " FCFA";
}

export default async function StoreServicesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getStoreServices(slug);
  if (!data) notFound();

  const { store, productsCount, services } = data;
  const locationLine = [store.quarter, store.location].filter(Boolean).join(", ");

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <section className="relative">
        <div
          className="h-40 md:h-56 w-full"
          style={{
            background: "linear-gradient(135deg, var(--purple), var(--blue))",
          }}
        />
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="-mt-16 md:-mt-20 flex flex-col md:flex-row md:items-end gap-5">
            <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden border-4 border-[var(--bg-base)] bg-[var(--glass-bg-subtle)] flex-shrink-0 shadow-xl">
              {store.image ? (
                <Image
                  src={store.image}
                  alt={store.businessName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <StoreIcon className="w-12 h-12 opacity-30" style={{ color: "var(--text-muted)" }} />
                </div>
              )}
            </div>

            <div className="flex-1 pb-2">
              <h1 className="text-2xl md:text-4xl font-extrabold" style={{ color: "var(--text-primary)" }}>
                {store.businessName}
              </h1>
              {store.businessType && (
                <p className="mt-1 text-sm font-semibold" style={{ color: "var(--purple)" }}>
                  {store.businessType}
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                {locationLine && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> {locationLine}
                  </span>
                )}
                {store.openingHours && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> {store.openingHours}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Package className="w-4 h-4" /> {services.length} service{services.length === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pb-2">
              <Link
                href={`/stores/${store.slug}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity"
                style={{ background: "linear-gradient(135deg, var(--purple), var(--blue))" }}
              >
                <ArrowRight className="w-4 h-4" /> Back to store
              </Link>
            </div>
          </div>

          {store.description && (
            <p className="mt-5 max-w-3xl text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {store.description}
            </p>
          )}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              Store Services
            </h2>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Browse all services offered by {store.businessName}.
            </p>
          </div>
          <div className="text-sm text-[var(--text-secondary)]">
            {services.length} service{services.length === 1 ? "" : "s"} · {productsCount} product{productsCount === 1 ? "" : "s"}
          </div>
        </div>

        {services.length === 0 ? (
          <div className="glass p-12 rounded-2xl text-center" style={{ border: "1px solid var(--glass-border)" }}>
            <Package className="w-14 h-14 mx-auto mb-3" style={{ color: "var(--text-disabled)" }} />
            <p className="font-semibold" style={{ color: "var(--text-muted)" }}>
              No services available from this store yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="rounded-2xl overflow-hidden transition-all hover:scale-[1.02]"
                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}
              >
                <div className="p-5">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{ background: "var(--badge-purple-bg)", color: "var(--badge-purple-text)" }}
                    >
                      {service.category?.name || "Service"}
                    </span>
                    {service.badge && (
                      <span
                        className="text-xs px-2 py-1 rounded-full text-white"
                        style={{ background: "linear-gradient(135deg, var(--scarlet), var(--purple))" }}
                      >
                        {service.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                    {service.name}
                  </h3>
                  <p className="text-sm mb-4 line-clamp-2" style={{ color: "var(--text-muted)" }}>
                    {service.description}
                  </p>
                  <div className="flex items-center gap-2 mb-4">
                    <Star size={14} fill="#fbbf24" style={{ color: "#fbbf24" }} />
                    <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      {service.rating.toFixed(1)}
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      ({service.reviews} reviews)
                    </span>
                  </div>
                  {service.availability && (
                    <div className="flex items-center gap-2 mb-4 text-xs" style={{ color: "var(--text-muted)" }}>
                      <Clock size={14} /> {service.availability}
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                        From {formatCurrency(service.options?.[0]?.amount ?? 0)}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {service.options.length} option{service.options.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    <Link
                      href={`/services/${service.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                      style={{ background: "linear-gradient(135deg, var(--purple), var(--blue))" }}
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
