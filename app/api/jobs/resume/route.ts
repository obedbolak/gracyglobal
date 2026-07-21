import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// ── Claude API config (mirrors app/api/chatbot/route.ts) ──────────────────────
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || "claude-haiku-4-5-20251001";
const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
const CLAUDE_API_VERSION = "2023-06-01";

// ── Types ─────────────────────────────────────────────────────────────────────
interface ResumeInput {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  targetRole?: string;
  yearsExperience?: string;
  summary?: string;
  workExperience?: string;
  education?: string;
  skills?: string;
  certifications?: string;
  languages?: string;
  links?: string;
}

export interface GeneratedResume {
  name: string;
  title: string;
  contact: {
    email?: string;
    phone?: string;
    location?: string;
    links: string[];
  };
  summary: string;
  experience: {
    role: string;
    company: string;
    period: string;
    location?: string;
    bullets: string[];
  }[];
  education: {
    degree: string;
    institution: string;
    period: string;
    details?: string;
  }[];
  skills: string[];
  certifications: string[];
  languages: string[];
}

// ── Claude call with retry (mirrors chatbot route) ────────────────────────────
async function callClaudeWithRetry(
  systemPrompt: string,
  message: string,
  maxRetries = 2,
) {
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(CLAUDE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY as string,
          "anthropic-version": CLAUDE_API_VERSION,
        },
        body: JSON.stringify({
          model: CLAUDE_MODEL,
          max_tokens: 1600,
          system: systemPrompt,
          messages: [{ role: "user", content: message }],
        }),
      });

      const data = await response.json();
      if (response.ok) return { data, ok: true as const };

      if (
        (response.status === 429 ||
          response.status === 529 ||
          response.status >= 500) &&
        attempt < maxRetries
      ) {
        await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt)));
        lastError = data;
        continue;
      }

      console.error("Claude resume error:", data);
      return { data, ok: false as const };
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt)));
        continue;
      }
    }
  }

  console.error("Claude resume error after retries:", lastError);
  return { data: null, ok: false as const };
}

function getAssistantText(data: unknown): string | null {
  const maybe = data as { content?: { type?: string; text?: string }[] };
  const text =
    maybe.content
      ?.filter((b) => b.type === "text")
      .map((b) => b.text ?? "")
      .join("") ?? "";
  return text.trim().length > 0 ? text : null;
}

// Pull the first {...} JSON object out of the model text, tolerating
// stray prose or ```json fences.
function extractJson(text: string): string | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return candidate.slice(start, end + 1);
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "The AI resume builder is not configured yet." },
        { status: 500 },
      );
    }

    const input = (await req.json()) as ResumeInput;

    if (!input.fullName?.trim() || !input.targetRole?.trim()) {
      return NextResponse.json(
        { error: "Full name and target role are required." },
        { status: 400 },
      );
    }

    const systemPrompt = `
You are an expert career coach and professional resume writer.
From the applicant details provided, produce a polished, ATS-friendly resume.

Return ONLY a single valid JSON object (no markdown, no commentary) with EXACTLY this shape:
{
  "name": string,
  "title": string,                       // concise professional headline, e.g. "Senior Frontend Engineer"
  "contact": {
    "email": string,                     // "" if unknown
    "phone": string,                     // "" if unknown
    "location": string,                  // "" if unknown
    "links": string[]                    // portfolio/LinkedIn/GitHub URLs, [] if none
  },
  "summary": string,                     // 2-4 sentence professional summary, written without "I"
  "experience": [                        // most recent first; infer reasonable structure from the raw text
    {
      "role": string,
      "company": string,
      "period": string,                  // e.g. "2021 - Present"; "" if unknown
      "location": string,                // "" if unknown
      "bullets": string[]                // 2-4 achievement-focused bullets, start with strong action verbs, quantify where plausible
    }
  ],
  "education": [
    { "degree": string, "institution": string, "period": string, "details": string }
  ],
  "skills": string[],                    // deduplicated, concise
  "certifications": string[],            // [] if none
  "languages": string[]                  // [] if none
}

Rules:
- Improve wording and impact, but NEVER invent employers, degrees, dates, or metrics that were not implied by the input. If a metric is unknown, keep the bullet qualitative.
- If a section has no source data, return an empty array (or "" for strings). Do not fabricate.
- Keep language professional, confident, and concise. No first-person pronouns in bullets.
- Output must be valid JSON and nothing else.
`.trim();

    const userMessage = `
Applicant details:
- Full name: ${input.fullName || ""}
- Target role: ${input.targetRole || ""}
- Email: ${input.email || ""}
- Phone: ${input.phone || ""}
- Location: ${input.location || ""}
- Years of experience: ${input.yearsExperience || ""}
- Professional summary (optional, may be rough): ${input.summary || ""}
- Work experience (raw, may be bullet points or prose):
${input.workExperience || "(none provided)"}
- Education (raw):
${input.education || "(none provided)"}
- Skills: ${input.skills || ""}
- Certifications: ${input.certifications || ""}
- Languages: ${input.languages || ""}
- Links (portfolio/LinkedIn/GitHub): ${input.links || ""}

Generate the resume JSON now.
`.trim();

    const { data, ok } = await callClaudeWithRetry(systemPrompt, userMessage);
    if (!ok || !data) {
      return NextResponse.json(
        { error: "Could not reach the AI service. Please try again shortly." },
        { status: 502 },
      );
    }

    const raw = getAssistantText(data);
    const jsonStr = raw ? extractJson(raw) : null;
    if (!jsonStr) {
      return NextResponse.json(
        { error: "The AI returned an unexpected response. Please try again." },
        { status: 502 },
      );
    }

    let resume: GeneratedResume;
    try {
      resume = JSON.parse(jsonStr) as GeneratedResume;
    } catch {
      return NextResponse.json(
        { error: "Failed to parse the generated resume. Please try again." },
        { status: 502 },
      );
    }

    // Defensive normalization so the client can render safely.
    resume.contact = resume.contact || { links: [] };
    resume.contact.links = resume.contact.links || [];
    resume.experience = resume.experience || [];
    resume.education = resume.education || [];
    resume.skills = resume.skills || [];
    resume.certifications = resume.certifications || [];
    resume.languages = resume.languages || [];

    return NextResponse.json({ resume });
  } catch (error: any) {
    console.error("POST /api/jobs/resume error:", error);
    return NextResponse.json(
      { error: "Something went wrong generating the resume." },
      { status: 500 },
    );
  }
}
