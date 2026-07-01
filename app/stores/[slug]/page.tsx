import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import {
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Store as StoreIcon,
  Star,
  Package,
} from "lucide-react";

// ── Data ──────────────────────────────────────────────────────────────────────

async function getStore(slug: string) {
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

  const products = await prisma.product.findMany({
    where: { sellerId: store.userId, active: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      price: true,
      images: true,
      rating: true,
      reviews: true,
      stock: true,
      badge: true,
      category: { select: { name: true } },
    },
  });

  const servicesCount = await prisma.service.count({
    where: { sellerId: store.userId, active: true },
  });

  return { store, products, servicesCount };
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getStore(slug);
  if (!data) return { title: "Store not found" };
  return {
    title: `${data.store.businessName} | GracyGlobal`,
    description:
      data.store.description ??
      `Shop products from ${data.store.businessName}.`,
    openGraph: {
      title: data.store.businessName,
      description: data.store.description ?? undefined,
      images: data.store.image ? [data.store.image] : undefined,
    },
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPrice(n: number) {
  return `${n.toLocaleString()} FCFA`;
}

function waLink(num: string) {
  const digits = num.replace(/[^0-9]/g, "");
  return `https://wa.me/${digits}`;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function StorefrontPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getStore(slug);
  if (!data) notFound();

  const { store, products, servicesCount } = data;
  const locationLine = [store.quarter, store.location]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      {/* Hero */}
      <section className="relative">
        <div
          className="h-40 md:h-56 w-full"
          style={{
            background: "linear-gradient(135deg, var(--purple), var(--blue))",
          }}
        />
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="-mt-16 md:-mt-20 flex flex-col md:flex-row md:items-end gap-5">
            {/* Logo */}
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
                  <StoreIcon
                    className="w-12 h-12 opacity-30"
                    style={{ color: "var(--text-muted)" }}
                  />
                </div>
              )}
            </div>

            {/* Title + meta */}
            <div className="flex-1 pb-2">
              <h1
                className="text-2xl md:text-4xl font-extrabold"
                style={{ color: "var(--text-primary)" }}
              >
                {store.businessName}
              </h1>
              {store.businessType && (
                <p
                  className="mt-1 text-sm font-semibold"
                  style={{ color: "var(--purple)" }}
                >
                  {store.businessType}
                </p>
              )}
              <div
                className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
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
                  <Package className="w-4 h-4" /> {products.length} product
                  {products.length === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            {/* Contact buttons */}
            <div className="flex flex-wrap items-center gap-2 pb-2">
              {store.whatsapp && (
                <a
                  href={waLink(store.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity"
                  style={{ background: "#25D366" }}
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
              )}
              {store.phone && (
                <a
                  href={`tel:${store.phone}`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-[var(--sidebar-item-hover)] transition-colors"
                  style={{
                    border: "1px solid var(--glass-border)",
                    color: "var(--text-primary)",
                  }}
                >
                  <Phone className="w-4 h-4" /> Call
                </a>
              )}
              {servicesCount > 0 && (
                <Link
                  href={`/stores/${store.slug}/services`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity"
                  style={{
                    background: "linear-gradient(135deg, var(--purple), var(--blue))",
                  }}
                >
                  <Package className="w-4 h-4" /> View services
                </Link>
              )}
            </div>
          </div>

          {/* Description */}
          {store.description && (
            <p
              className="mt-5 max-w-3xl text-sm leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              {store.description}
            </p>
          )}
        </div>
      </section>

      {/* Products */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        <h2
          className="text-xl font-bold mb-5"
          style={{ color: "var(--text-primary)" }}
        >
          Products
        </h2>

        {products.length === 0 ? (
          <div
            className="glass p-12 rounded-2xl text-center"
            style={{ border: "1px solid var(--glass-border)" }}
          >
            <Package
              className="w-14 h-14 mx-auto mb-3"
              style={{ color: "var(--text-disabled)" }}
            />
            <p className="font-semibold" style={{ color: "var(--text-muted)" }}>
              This store has no products yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/marketplace/${p.id}`}
                className="glass rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform"
                style={{ border: "1px solid var(--glass-border)" }}
              >
                <div className="relative h-40 bg-[var(--glass-bg-subtle)]">
                  {p.images?.[0] ? (
                    <Image
                      src={p.images[0]}
                      alt={p.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Package
                        className="w-10 h-10 opacity-20"
                        style={{ color: "var(--text-muted)" }}
                      />
                    </div>
                  )}
                  {p.badge && (
                    <span
                      className="absolute top-2 left-2 text-[10px] font-bold px-2 py-1 rounded-full text-white"
                      style={{ background: "var(--purple)" }}
                    >
                      {p.badge}
                    </span>
                  )}
                  {p.stock === 0 && (
                    <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-1 rounded-full bg-red-100 text-red-600">
                      Sold out
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p
                    className="text-[10px] uppercase tracking-wider mb-1"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {p.category?.name ?? "Uncategorized"}
                  </p>
                  <h3
                    className="font-semibold text-sm truncate mb-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {p.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span
                      className="font-bold text-sm"
                      style={{ color: "var(--accent-primary)" }}
                    >
                      {formatPrice(p.price)}
                    </span>
                    <div
                      className="flex items-center gap-1 text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {p.rating.toFixed(1)} ({p.reviews})
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
