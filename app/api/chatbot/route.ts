import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SITE_LINKS = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
  { label: "Marketplace", path: "/marketplace" },
  { label: "Cart", path: "/marketplace/cart" },
  { label: "Services", path: "/services" },
  { label: "Courses", path: "/learn" },
  { label: "Jobs", path: "/jobs" },
  { label: "Community", path: "/community" },
  { label: "Counselors", path: "/counselors" },
  { label: "Affiliate", path: "/affiliate" },
  { label: "Plans", path: "/plans" },
  { label: "Blog", path: "/blog" },
  { label: "Docs", path: "/docs" },
  { label: "Login", path: "/login" },
  { label: "Register", path: "/register" },
  { label: "Dashboard", path: "/dashboard" },
  { label: "Store Dashboard", path: "/dashboard/store" },
  { label: "Services Dashboard", path: "/services-dashboard" },
  { label: "Teacher Dashboard", path: "/teacher" },
  { label: "Counselor Dashboard", path: "/counselor" },
  { label: "Terms", path: "/terms" },
  { label: "Privacy", path: "/privacy" },
  { label: "Cookie Policy", path: "/cookie-policy" },
];

const CONTACT_DETAILS = {
  email: "support@gracyglobal.com",
  phone: "+237 67 68 69 844",
  address: "GracyGlobal, Yaounde, Cameroon",
  hours: "Monday-Friday 8:00 AM-6:00 PM; Saturday 9:00 AM-4:00 PM",
};

const LOCAL_SITE_URL = "http://localhost:3000";
const PRODUCTION_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://gracyglobal.com";

const STOP_WORDS = new Set([
  "a",
  "about",
  "all",
  "an",
  "and",
  "any",
  "are",
  "can",
  "details",
  "do",
  "find",
  "for",
  "get",
  "give",
  "have",
  "help",
  "how",
  "i",
  "in",
  "info",
  "is",
  "link",
  "links",
  "me",
  "need",
  "of",
  "on",
  "or",
  "please",
  "product",
  "products",
  "recommend",
  "search",
  "service",
  "services",
  "show",
  "suggest",
  "tell",
  "that",
  "the",
  "to",
  "want",
  "website",
  "what",
  "where",
  "with",
  "you",
]);

function absoluteUrl(baseUrl: string, path: string) {
  return new URL(path, baseUrl).toString();
}

function formatCurrency(value: number) {
  return `${value.toLocaleString("en-US")} FCFA`;
}

function shortText(value: string | null | undefined, max = 180) {
  if (!value) return "";
  const compact = value.replace(/\s+/g, " ").trim();
  return compact.length > max ? `${compact.slice(0, max - 1)}...` : compact;
}

function getSearchTerms(message: string) {
  const words = message
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));

  return [...new Set(words)].slice(0, 8);
}

function getSearchWhere(terms: string[]) {
  if (terms.length === 0) return undefined;
  return {
    OR: terms.flatMap((term) => [
      { name: { contains: term, mode: "insensitive" as const } },
      { description: { contains: term, mode: "insensitive" as const } },
    ]),
  };
}

function getTitleSearchWhere(terms: string[]) {
  if (terms.length === 0) return undefined;
  return {
    OR: terms.flatMap((term) => [
      { title: { contains: term, mode: "insensitive" as const } },
      { description: { contains: term, mode: "insensitive" as const } },
    ]),
  };
}

async function getWebsiteContext(message: string, baseUrl: string) {
  const terms = getSearchTerms(message);
  const productSearch = getSearchWhere(terms);
  const serviceSearch = getSearchWhere(terms);
  const titleSearch = getTitleSearchWhere(terms);

  const [
    productCount,
    serviceCount,
    courseCount,
    jobCount,
    communityCount,
    counselorCount,
    storeCount,
    products,
    featuredProducts,
    services,
    stores,
    courses,
    jobs,
    communities,
    counselors,
  ] = await Promise.all([
    prisma.product.count({ where: { active: true, stock: { gt: 0 } } }),
    prisma.service.count({ where: { active: true } }),
    prisma.course.count({ where: { published: true } }),
    prisma.job.count({ where: { active: true } }),
    prisma.community.count(),
    prisma.counselor.count({ where: { available: true } }),
    prisma.store.count({ where: { active: true } }),
    prisma.product.findMany({
      where: {
        active: true,
        stock: { gt: 0 },
        ...(productSearch ?? {}),
      },
      take: 8,
      orderBy: [
        { featured: "desc" },
        { rating: "desc" },
        { createdAt: "desc" },
      ],
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        stock: true,
        rating: true,
        reviews: true,
        badge: true,
        benefits: true,
        category: { select: { name: true } },
        seller: {
          select: {
            name: true,
            store: {
              select: {
                slug: true,
                businessName: true,
                location: true,
                quarter: true,
                phone: true,
                whatsapp: true,
              },
            },
          },
        },
      },
    }),
    prisma.product.findMany({
      where: { active: true, stock: { gt: 0 }, featured: true },
      take: 5,
      orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        price: true,
        category: { select: { name: true } },
      },
    }),
    prisma.service.findMany({
      where: {
        active: true,
        ...(serviceSearch ?? {}),
      },
      take: 8,
      orderBy: [
        { featured: "desc" },
        { rating: "desc" },
        { createdAt: "desc" },
      ],
      select: {
        id: true,
        name: true,
        description: true,
        group: true,
        availability: true,
        rating: true,
        reviews: true,
        includes: true,
        category: { select: { name: true } },
        options: {
          where: { active: true },
          orderBy: { amount: "asc" },
          take: 3,
          select: { name: true, amount: true, label: true, duration: true },
        },
        seller: {
          select: {
            name: true,
            store: {
              select: {
                slug: true,
                businessName: true,
                location: true,
                quarter: true,
                phone: true,
                whatsapp: true,
              },
            },
          },
        },
      },
    }),
    prisma.store.findMany({
      where: {
        active: true,
        ...(terms.length
          ? {
              OR: terms.flatMap((term) => [
                {
                  businessName: {
                    contains: term,
                    mode: "insensitive" as const,
                  },
                },
                {
                  businessType: {
                    contains: term,
                    mode: "insensitive" as const,
                  },
                },
                { location: { contains: term, mode: "insensitive" as const } },
                { quarter: { contains: term, mode: "insensitive" as const } },
                {
                  description: { contains: term, mode: "insensitive" as const },
                },
              ]),
            }
          : {}),
      },
      take: 6,
      orderBy: { createdAt: "desc" },
      select: {
        slug: true,
        businessName: true,
        businessType: true,
        location: true,
        quarter: true,
        openingHours: true,
        phone: true,
        whatsapp: true,
        description: true,
      },
    }),
    prisma.course.findMany({
      where: {
        published: true,
        ...(titleSearch ?? {}),
      },
      take: 6,
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        isFree: true,
        level: true,
        category: { select: { name: true } },
      },
    }),
    prisma.job.findMany({
      where: {
        active: true,
        ...(terms.length
          ? {
              OR: terms.flatMap((term) => [
                { title: { contains: term, mode: "insensitive" as const } },
                { company: { contains: term, mode: "insensitive" as const } },
                {
                  description: { contains: term, mode: "insensitive" as const },
                },
              ]),
            }
          : {}),
      },
      take: 6,
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        company: true,
        location: true,
        type: true,
        salaryMin: true,
        salaryMax: true,
        skills: true,
      },
    }),
    prisma.community.findMany({
      where: terms.length
        ? {
            OR: terms.flatMap((term) => [
              { name: { contains: term, mode: "insensitive" as const } },
              { description: { contains: term, mode: "insensitive" as const } },
              { category: { contains: term, mode: "insensitive" as const } },
            ]),
          }
        : {},
      take: 6,
      orderBy: { createdAt: "desc" },
      select: {
        slug: true,
        name: true,
        description: true,
        category: true,
        _count: { select: { members: true, posts: true } },
      },
    }),
    prisma.counselor.findMany({
      where: {
        available: true,
        ...(terms.length
          ? {
              OR: terms.flatMap((term) => [
                { specialty: { contains: term, mode: "insensitive" as const } },
                { bio: { contains: term, mode: "insensitive" as const } },
                {
                  user: {
                    name: { contains: term, mode: "insensitive" as const },
                  },
                },
              ]),
            }
          : {}),
      },
      take: 6,
      orderBy: [{ verified: "desc" }, { rating: "desc" }],
      select: {
        id: true,
        specialty: true,
        bio: true,
        rating: true,
        reviews: true,
        pricePerHour: true,
        verified: true,
        user: { select: { name: true } },
      },
    }),
  ]);

  const linkGuide = SITE_LINKS.map(
    (link) => `- ${link.label}: ${absoluteUrl(baseUrl, link.path)}`,
  ).join("\n");

  const dynamicPatterns = [
    `- Product detail: ${absoluteUrl(baseUrl, "/marketplace/{productId}")}`,
    `- Service detail/book: ${absoluteUrl(baseUrl, "/services/{serviceId}")}`,
    `- Storefront: ${absoluteUrl(baseUrl, "/stores/{storeSlug}")}`,
    `- Store services: ${absoluteUrl(baseUrl, "/stores/{storeSlug}/services")}`,
    `- Course detail: ${absoluteUrl(baseUrl, "/learn/{courseId}")}`,
    `- Job detail: ${absoluteUrl(baseUrl, "/jobs/{jobId}")}`,
    `- Community detail: ${absoluteUrl(baseUrl, "/community/{communitySlug}")}`,
    `- Counselor booking: ${absoluteUrl(baseUrl, "/counselors/{counselorId}/book")}`,
  ].join("\n");

  const productLines = products.map((product) => {
    const store = product.seller?.store;
    const seller =
      store?.businessName || product.seller?.name || "GracyGlobal seller";
    const storeContact = [
      store?.phone ? `phone ${store.phone}` : "",
      store?.whatsapp ? `WhatsApp ${store.whatsapp}` : "",
    ]
      .filter(Boolean)
      .join(", ");

    return [
      `- ${product.name} (${formatCurrency(product.price)}, ${product.stock} in stock)`,
      `  Link: ${absoluteUrl(baseUrl, `/marketplace/${product.id}`)}`,
      `  Category: ${product.category?.name ?? "Marketplace"}; seller: ${seller}`,
      store?.slug
        ? `  Store: ${absoluteUrl(baseUrl, `/stores/${store.slug}`)}`
        : "",
      storeContact ? `  Seller contact: ${storeContact}` : "",
      product.rating
        ? `  Rating: ${product.rating.toFixed(1)} (${product.reviews} reviews)`
        : "",
      product.badge ? `  Badge: ${product.badge}` : "",
      product.benefits.length
        ? `  Benefits: ${product.benefits.slice(0, 3).join(", ")}`
        : "",
      `  Description: ${shortText(product.description)}`,
    ]
      .filter(Boolean)
      .join("\n");
  });

  const featuredProductLines = featuredProducts.map(
    (product) =>
      `- ${product.name}: ${formatCurrency(product.price)} (${product.category?.name ?? "Marketplace"}) ${absoluteUrl(baseUrl, `/marketplace/${product.id}`)}`,
  );

  const serviceLines = services.map((service) => {
    const store = service.seller?.store;
    const startingPrice = service.options[0]?.amount;
    const storeContact = [
      store?.phone ? `phone ${store.phone}` : "",
      store?.whatsapp ? `WhatsApp ${store.whatsapp}` : "",
    ]
      .filter(Boolean)
      .join(", ");

    return [
      `- ${service.name}${startingPrice ? ` (from ${formatCurrency(startingPrice)})` : ""}`,
      `  Link: ${absoluteUrl(baseUrl, `/services/${service.id}`)}`,
      `  Category: ${service.category?.name ?? service.group}; provider: ${store?.businessName || service.seller?.name || "Service provider"}`,
      store?.slug
        ? `  Provider services: ${absoluteUrl(baseUrl, `/stores/${store.slug}/services`)}`
        : "",
      storeContact ? `  Provider contact: ${storeContact}` : "",
      service.availability ? `  Availability: ${service.availability}` : "",
      service.includes.length
        ? `  Includes: ${service.includes.slice(0, 4).join(", ")}`
        : "",
      `  Description: ${shortText(service.description)}`,
    ]
      .filter(Boolean)
      .join("\n");
  });

  const storeLines = stores.map((store) =>
    [
      `- ${store.businessName} (${store.businessType ?? "Business"})`,
      store.slug
        ? `  Link: ${absoluteUrl(baseUrl, `/stores/${store.slug}`)}`
        : "",
      store.slug
        ? `  Services: ${absoluteUrl(baseUrl, `/stores/${store.slug}/services`)}`
        : "",
      [store.quarter, store.location].filter(Boolean).length
        ? `  Location: ${[store.quarter, store.location].filter(Boolean).join(", ")}`
        : "",
      store.openingHours ? `  Hours: ${store.openingHours}` : "",
      store.phone ? `  Phone: ${store.phone}` : "",
      store.whatsapp ? `  WhatsApp: ${store.whatsapp}` : "",
      store.description ? `  About: ${shortText(store.description)}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  );

  const courseLines = courses.map((course) =>
    [
      `- ${course.title} (${course.isFree ? "Free" : formatCurrency(course.price)}, ${course.level})`,
      `  Link: ${absoluteUrl(baseUrl, `/learn/${course.id}`)}`,
      `  Category: ${course.category?.name ?? "Course"}`,
      `  Description: ${shortText(course.description)}`,
    ].join("\n"),
  );

  const jobLines = jobs.map((job) =>
    [
      `- ${job.title} at ${job.company} (${job.type}${job.location ? `, ${job.location}` : ""})`,
      `  Link: ${absoluteUrl(baseUrl, `/jobs/${job.id}`)}`,
      job.salaryMin || job.salaryMax
        ? `  Salary: ${job.salaryMin ? formatCurrency(job.salaryMin) : "N/A"}-${job.salaryMax ? formatCurrency(job.salaryMax) : "N/A"}`
        : "",
      job.skills.length ? `  Skills: ${job.skills.slice(0, 5).join(", ")}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  );

  const communityLines = communities.map((community) =>
    [
      `- ${community.name} (${community.category})`,
      `  Link: ${absoluteUrl(baseUrl, `/community/${community.slug}`)}`,
      `  Members/posts: ${community._count.members}/${community._count.posts}`,
      `  Description: ${shortText(community.description)}`,
    ].join("\n"),
  );

  const counselorLines = counselors.map((counselor) =>
    [
      `- ${counselor.user.name ?? "Counselor"} (${counselor.specialty})`,
      `  Booking link: ${absoluteUrl(baseUrl, `/counselors/${counselor.id}/book`)}`,
      `  Price: ${formatCurrency(counselor.pricePerHour)} per hour`,
      `  Rating: ${counselor.rating.toFixed(1)} (${counselor.reviews} reviews)${counselor.verified ? "; verified" : ""}`,
      counselor.bio ? `  Bio: ${shortText(counselor.bio)}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return `
GRACYGLOBAL LIVE WEBSITE CONTEXT

Base URL for all links: ${baseUrl}

Official contact details:
- Email: ${CONTACT_DETAILS.email}
- Phone: ${CONTACT_DETAILS.phone}
- Address: ${CONTACT_DETAILS.address}
- Business hours: ${CONTACT_DETAILS.hours}
- Contact page: ${absoluteUrl(baseUrl, "/contact")}

Current public inventory counts:
- Products in stock: ${productCount}
- Services: ${serviceCount}
- Courses: ${courseCount}
- Jobs: ${jobCount}
- Communities: ${communityCount}
- Available counselors: ${counselorCount}
- Active stores: ${storeCount}

Main website links:
${linkGuide}

Dynamic link patterns:
${dynamicPatterns}

Search terms detected from the user's message: ${terms.length ? terms.join(", ") : "none; showing featured/recent items"}

Matching products:
${productLines.length ? productLines.join("\n") : "- No matching in-stock products found."}

Featured product suggestions:
${featuredProductLines.length ? featuredProductLines.join("\n") : "- No featured products found."}

Matching services:
${serviceLines.length ? serviceLines.join("\n") : "- No matching services found."}

Matching stores and contact details:
${storeLines.length ? storeLines.join("\n") : "- No matching stores found."}

Matching courses:
${courseLines.length ? courseLines.join("\n") : "- No matching courses found."}

Matching jobs:
${jobLines.length ? jobLines.join("\n") : "- No matching jobs found."}

Matching communities:
${communityLines.length ? communityLines.join("\n") : "- No matching communities found."}

Matching counselors:
${counselorLines.length ? counselorLines.join("\n") : "- No matching counselors found."}
`.trim();
}

function getBaseUrl(_req: Request) {
  const isProduction = process.env.NODE_ENV === "production";
  return isProduction ? `${PRODUCTION_SITE_URL}/` : `${LOCAL_SITE_URL}/`;
}

function getAssistantText(data: unknown) {
  if (
    data &&
    typeof data === "object" &&
    "output_text" in data &&
    typeof data.output_text === "string"
  ) {
    return data.output_text;
  }

  const maybeData = data as {
    output?: { content?: { text?: string }[] }[];
  };

  return maybeData.output?.[0]?.content?.[0]?.text ?? null;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { message?: unknown };
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!message) {
      return NextResponse.json(
        { reply: "Please send a message so I can help." },
        { status: 400 },
      );
    }

    if (
      !process.env.AZURE_OPENAI_ENDPOINT ||
      !process.env.AZURE_OPENAI_KEY ||
      !process.env.AZURE_OPENAI_DEPLOYMENT
    ) {
      return NextResponse.json(
        { reply: "The AI assistant is not configured yet." },
        { status: 500 },
      );
    }

    const baseUrl = getBaseUrl(req);
    const siteContext = await getWebsiteContext(message, baseUrl);

    const systemPrompt = `
You are Gracy Assistant, the official AI guide for GracyGlobal.
The website is a Next.js app with hooks and API routes, but visitors need simple, useful answers.

Use the live website context below as your source of truth.
Rules:
- Answer with real GracyGlobal links from the context whenever useful.
- For product searches, recommend matching in-stock products first. Include price, direct product link, and seller/store contact when available.
- For service searches, include the service booking/detail link and provider contact when available.
- For store/provider questions, share the storefront, store services link, location, phone, and WhatsApp when available.
- For contact questions, use the official contact details in the context.
- If you cannot find an exact match, say that clearly and suggest the closest relevant page or search/category link.
- Do not invent product availability, prices, phone numbers, addresses, policies, or links.
- Keep answers concise, friendly, and easy to scan.

${siteContext}
`.trim();

    const response = await fetch(
      `${process.env.AZURE_OPENAI_ENDPOINT}/openai/v1/responses`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.AZURE_OPENAI_KEY,
        },
        body: JSON.stringify({
          input: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
          model: process.env.AZURE_OPENAI_DEPLOYMENT,
          max_output_tokens: 700,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Azure OpenAI chatbot error:", data);
      return NextResponse.json(
        {
          reply:
            "I could not reach the AI assistant right now. Please try again shortly.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      reply:
        getAssistantText(data) ??
        "I could not generate a response right now. Please try again.",
    });
  } catch (error) {
    console.error("POST /api/chatbot error:", error);
    return NextResponse.json(
      { reply: "Something went wrong while preparing the assistant response." },
      { status: 500 },
    );
  }
}
