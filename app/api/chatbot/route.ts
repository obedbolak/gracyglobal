import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

// ── Scraper ────────────────────────────────────────────────────────────────────

async function scrapePageText(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 }, // cache for 1 hour
      headers: {
        "User-Agent": "GracyBot/1.0 (internal assistant)",
      },
    });
    if (!res.ok) return "";
    const html = await res.text();
    const $ = cheerio.load(html);

    // Remove noise
    $(
      "script, style, nav, header, footer, head, noscript, svg, iframe",
    ).remove();

    // Extract structured content
    const title = $("title").text().trim();
    const metaDesc = $('meta[name="description"]').attr("content") ?? "";
    const h1s = $("h1")
      .map((_, el) => $(el).text().trim())
      .get()
      .join(" | ");
    const h2s = $("h2")
      .map((_, el) => $(el).text().trim())
      .get()
      .join(" | ");
    const bodyText = $("body")
      .text()
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 2000);

    return `Title: ${title}\nDescription: ${metaDesc}\nH1: ${h1s}\nH2: ${h2s}\nContent: ${bodyText}`;
  } catch {
    return "";
  }
}

// ── Pages to scrape ────────────────────────────────────────────────────────────
// Add or remove URLs as your site grows

const BASE = "https://gracyglobal.com";

const PAGES_TO_SCRAPE: { label: string; url: string }[] = [
  { label: "Home", url: `${BASE}` },
  { label: "Contact", url: `${BASE}/contact` },
  { label: "About", url: `${BASE}/about` },
  { label: "Counselors", url: `${BASE}/counselors` },
  { label: "Remote Jobs", url: `${BASE}/remote-jobs` },
  { label: "Marketplace", url: `${BASE}/marketplace` },
  { label: "Services", url: `${BASE}/services` },
  { label: "E-learning", url: `${BASE}/e-learning` },
  { label: "Affiliate", url: `${BASE}/affiliate` },
  { label: "Community", url: `${BASE}/community` },
  { label: "Blog", url: `${BASE}/blog` },
  { label: "Plans", url: `${BASE}/plans` },
];

// ── Cache scraped content in memory (resets on server restart) ─────────────────

let cachedContext: string | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

async function getSiteContext(): Promise<string> {
  const now = Date.now();
  if (cachedContext && now - cacheTimestamp < CACHE_TTL) {
    return cachedContext;
  }

  // Scrape all pages in parallel
  const results = await Promise.all(
    PAGES_TO_SCRAPE.map(async ({ label, url }) => {
      const text = await scrapePageText(url);
      return text
        ? `\n== ${label.toUpperCase()} PAGE (${url}) ==\n${text}`
        : "";
    }),
  );

  cachedContext = results.filter(Boolean).join("\n");
  cacheTimestamp = now;
  return cachedContext;
}

// ── API Route ──────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const { message } = await req.json();

  const siteContent = await getSiteContext();

  const systemPrompt = `
You are Gracy Assistant, the official AI guide for GracyGlobal.com.
You are warm, professional, empathetic, and always helpful.

Use ONLY the website content below to answer questions about GracyGlobal.
- If asked for contact info, phone numbers, emails, or addresses — find them in the content and share them directly.
- If the answer isn't in the content, say: "For the most accurate info, please reach out to our support team via the Contact page at https://gracyglobal.com/contact"
- Never make up information.
- Keep answers concise and friendly.

${siteContent}
`.trim();

  const response = await fetch(
    `${process.env.AZURE_OPENAI_ENDPOINT}/openai/v1/responses`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.AZURE_OPENAI_KEY!,
      },
      body: JSON.stringify({
        input: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        model: process.env.AZURE_OPENAI_DEPLOYMENT,
        max_output_tokens: 500,
      }),
    },
  );

  const data = await response.json();
  return NextResponse.json({ reply: data.output[0].content[0].text });
}
