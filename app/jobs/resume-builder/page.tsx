"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { Eye, X, Download, SlidersHorizontal, Search, Phone, Mail, MapPin, Settings, User, Briefcase, GraduationCap, Award } from "lucide-react";
import ProfileUpload from "@/components/shared/ProfileUpload";

// Shape returned by /api/jobs/resume (kept in sync with the route handler).
export interface GeneratedResume {
  photoUrl?: string;
  name?: string;
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



// ─── AI Resume Builder ────────────────────────────────────────────────────────

// jsPDF and html2canvas-pro are bundled dependencies pulled in with dynamic
// import(), so they are code-split and only fetched when someone actually
// downloads.
//
// They used to be <script> tags pointing at a CDN, which is what caused the
// "Could not load the PDF library" failures: an ad-blocker, an offline moment
// or an unreachable CDN broke the core feature with no fallback. A bundled
// import cannot fail that way.
//
// Requires: npm i jspdf html2canvas-pro
async function loadJsPDF() {
  return (await import("jspdf")).jsPDF;
}

// A4 at 96dpi, in CSS pixels. The preview sizing, the page separation and the
// PDF slicing are all derived from these two numbers, so the thing on screen
// and the thing that downloads cannot drift apart.
const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

// Sub-pixel rounding, a stray margin or a border can push a sheet a handful of
// pixels past A4 and cost a whole extra, near-blank page. Overflow smaller than
// this is folded back into the last page instead of starting a new one.
const PAGE_OVERFLOW_TOLERANCE_PX = 28;

function countPages(contentHeightPx: number) {
  const usable = Math.max(contentHeightPx - PAGE_OVERFLOW_TOLERANCE_PX, 1);
  return Math.max(1, Math.ceil(usable / A4_HEIGHT_PX));
}

// React state changes do not reach the DOM synchronously. Anything that
// captures the off-screen preview immediately after a setState has to wait for
// the browser to paint, or html2canvas rasterises the PREVIOUS render - which
// is how an AI-polished resume could download as the unpolished draft.
function nextPaint() {
  return new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );
}

// html2canvas-pro rather than html2canvas: this project is on Tailwind v4,
// which emits oklch() colours and compiles opacity modifiers to
// color-mix(in oklab, ...). Stock html2canvas 1.4.1 throws
// 'unsupported color function' on both. The pro fork has an identical API and
// understands lab/lch/oklab/oklch.
async function loadHtml2Canvas() {
  return (await import("html2canvas-pro")).default;
}

function resumeFileName(name?: string) {
  const safe = (name || "resume")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return `${safe || "resume"}-resume.pdf`;
}

// Rasterises the ACTUAL preview DOM node and slices it into A4 pages.
//
// This is what makes the download match the preview. The older text-drawing
// version below rebuilds the resume from scratch in Helvetica with its own
// margins, so it ignores the chosen template, the accent colour, the profile
// photo and the photo shape entirely - the preview and the PDF shared no code
// at all.
async function downloadResumePdfFromNode(
  node: HTMLElement | null,
  fileName: string,
) {
  if (!node) throw new Error("The preview is not ready yet. Please try again.");

  const [JsPDF, html2canvas] = await Promise.all([
    loadJsPDF(),
    loadHtml2Canvas(),
  ]);

  // 2x keeps text crisp without making the file enormous.
  const CAPTURE_SCALE = 2;

  const canvas = await html2canvas(node, {
    scale: CAPTURE_SCALE,
    useCORS: true,
    backgroundColor: "#ffffff",
    windowWidth: A4_WIDTH_PX,
    // Neutralise any preview transform in the CLONE, so the live DOM is never
    // touched and we always capture at true A4 width.
    onclone: (_doc: Document, el: HTMLElement) => {
      el.style.transform = "none";
      el.style.width = `${A4_WIDTH_PX}px`;
    },
    // The bundled types are stricter than the runtime options bag.
  } as any);

  const doc = new JsPDF({ unit: "pt", format: "a4" });
  const pdfW = doc.internal.pageSize.getWidth();
  const pdfH = doc.internal.pageSize.getHeight();

  // One PDF page per A4_HEIGHT_PX of captured content - the same boundaries
  // the preview draws its page-break markers at.
  const slicePx = A4_HEIGHT_PX * CAPTURE_SCALE;
  const pageCount = countPages(canvas.height / CAPTURE_SCALE);

  for (let page = 0; page < pageCount; page++) {
    const offset = page * slicePx;
    // The final page takes whatever is left, even if that is slightly more
    // than one sheet: addImage below scales it down by at most the tolerance
    // (~2.5%), which is invisible and loses nothing off the bottom.
    const sliceHeight =
      page === pageCount - 1
        ? canvas.height - offset
        : Math.min(slicePx, canvas.height - offset);
    if (sliceHeight <= 0) break;

    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = canvas.width;
    pageCanvas.height = sliceHeight;

    const ctx = pageCanvas.getContext("2d");
    if (!ctx) throw new Error("Could not prepare the PDF page.");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
    ctx.drawImage(
      canvas,
      0,
      offset,
      canvas.width,
      sliceHeight,
      0,
      0,
      canvas.width,
      sliceHeight,
    );

    if (page > 0) doc.addPage();
    // Width always fills the page; height stays proportional so a short final
    // page sits at the top rather than being stretched to fill the sheet.
    const drawHeight = Math.min((sliceHeight / canvas.width) * pdfW, pdfH);
    doc.addImage(
      pageCanvas.toDataURL("image/jpeg", 0.95),
      "JPEG",
      0,
      0,
      pdfW,
      drawHeight,
    );
  }

  doc.save(fileName);
}

// Vector, selectable-text version. No longer wired to the main download button
// because it cannot reproduce the templates, but kept because its output is
// real text and therefore parseable by applicant tracking systems.
async function downloadAtsResumePdf(
  resume: GeneratedResume,
  template: ResumeTemplate = "classic",
) {
  const JsPDF = await loadJsPDF();
  const doc = new JsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentW = pageW - margin * 2;
  let y = margin;

  // Template accent colors (RGB)
  const accentColors: Record<string, [number, number, number]> = {
    classic: [120, 90, 220],
    modern: [37, 99, 235],
    minimal: [55, 65, 81],
    bold: [220, 38, 38],
  };
  const [aR, aG, aB] = accentColors[template] || accentColors.classic;

  const ensure = (needed: number) => {
    if (y + needed > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const sectionHeader = (label: string) => {
    ensure(34);
    y += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text(label.toUpperCase(), margin, y);
    y += 5;
    doc.setDrawColor(aR, aG, aB);
    doc.setLineWidth(1.5);
    doc.line(margin, y, margin + 34, y);
    doc.setLineWidth(1);
    y += 15;
  };

  // Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(20, 20, 20);
  doc.text(resume.name || "", margin, y);
  y += 22;

  // Title
  if (resume.title) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(aR, aG, aB);
    doc.text(resume.title, margin, y);
    y += 15;
  }

  // Contact line
  const contactParts = [
    resume.contact?.email,
    resume.contact?.phone,
    resume.contact?.location,
    ...(resume.contact?.links || []),
  ].filter(Boolean) as string[];
  if (contactParts.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(110, 110, 110);
    const lines = doc.splitTextToSize(contactParts.join("   |   "), contentW);
    doc.text(lines, margin, y);
    y += lines.length * 12 + 4;
  }

  doc.setDrawColor(210, 210, 210);
  doc.line(margin, y, pageW - margin, y);
  y += 4;

  // Summary
  if (resume.summary) {
    sectionHeader("Summary");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(70, 70, 70);
    const lines = doc.splitTextToSize(resume.summary, contentW);
    ensure(lines.length * 13);
    doc.text(lines, margin, y);
    y += lines.length * 13 + 6;
  }

  // Experience
  if (resume.experience?.length) {
    sectionHeader("Experience");
    resume.experience.forEach((exp) => {
      ensure(46);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(30, 30, 30);
      const roleCompany = [exp.role, exp.company].filter(Boolean).join(" — ");
      doc.text(roleCompany, margin, y);
      if (exp.period) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.text(exp.period, pageW - margin, y, { align: "right" });
      }
      y += 13;
      if (exp.location) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.setTextColor(130, 130, 130);
        doc.text(exp.location, margin, y);
        y += 12;
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(70, 70, 70);
      (exp.bullets || []).forEach((b) => {
        const bl = doc.splitTextToSize("•  " + b, contentW - 10);
        ensure(bl.length * 13);
        doc.text(bl, margin + 8, y);
        y += bl.length * 13 + 1;
      });
      y += 8;
    });
  }

  // Education
  if (resume.education?.length) {
    sectionHeader("Education");
    resume.education.forEach((ed) => {
      ensure(30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(30, 30, 30);
      doc.text(
        [ed.degree, ed.institution].filter(Boolean).join(" — "),
        margin,
        y,
      );
      if (ed.period) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.text(ed.period, pageW - margin, y, { align: "right" });
      }
      y += 13;
      if (ed.details) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(90, 90, 90);
        const dl = doc.splitTextToSize(ed.details, contentW);
        ensure(dl.length * 12);
        doc.text(dl, margin, y);
        y += dl.length * 12 + 1;
      }
      y += 8;
    });
  }

  // Skills
  if (resume.skills?.length) {
    sectionHeader("Skills");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(70, 70, 70);
    const sl = doc.splitTextToSize(resume.skills.join("   •   "), contentW);
    ensure(sl.length * 13);
    doc.text(sl, margin, y);
    y += sl.length * 13 + 6;
  }

  // Certifications
  if (resume.certifications?.length) {
    sectionHeader("Certifications");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(70, 70, 70);
    resume.certifications.forEach((c) => {
      const cl = doc.splitTextToSize("•  " + c, contentW - 10);
      ensure(cl.length * 13);
      doc.text(cl, margin + 8, y);
      y += cl.length * 13 + 1;
    });
    y += 6;
  }

  // Languages
  if (resume.languages?.length) {
    sectionHeader("Languages");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(70, 70, 70);
    const ll = doc.splitTextToSize(resume.languages.join("   •   "), contentW);
    ensure(ll.length * 13);
    doc.text(ll, margin, y);
    y += ll.length * 13 + 4;
  }

  const safe = (resume.name || "resume")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  doc.save(`${safe || "resume"}-resume.pdf`);
}

type ResumeTemplate = "classic" | "modern" | "minimal" | "bold";

const RESUME_TEMPLATES: {
  id: ResumeTemplate;
  label: string;
  desc: string;
  accent: string;
  icon: string;
}[] = [
  {
    id: "classic",
    label: "Classic",
    desc: "Traditional and professional",
    accent: "#7b5ade",
    icon: "📄",
  },
  {
    id: "modern",
    label: "Modern",
    desc: "Clean with bold accents",
    accent: "#2563eb",
    icon: "✨",
  },
  {
    id: "minimal",
    label: "Minimal",
    desc: "Simple and elegant",
    accent: "#374151",
    icon: "◻️",
  },
  {
    id: "bold",
    label: "Bold",
    desc: "Strong visual impact",
    accent: "#dc2626",
    icon: "🔥",
  },
];

interface ResumeForm {
  template: ResumeTemplate;
  photoUrl: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  targetRole: string;
  yearsExperience: string;
  summary: string;
  workExperience: string;
  education: string;
  skills: string;
  certifications: string;
  languages: string;
  links: string;
  // AI tailoring. optimizeWithAi is an explicit opt-in: nothing is sent to the
  // model unless the applicant chooses it. The institution fields are only
  // collected when they do, and are context for tailoring - never new facts.
  optimizeWithAi: "yes" | "no";
  targetCompany: string;
  institutionDetails: string;
  customColor?: string;
  imageShape?: "circle" | "square" | "rounded";
}

const EMPTY_RESUME_FORM: ResumeForm = {
  template: "classic",
  photoUrl: "",
  fullName: "",
  email: "",
  phone: "",
  location: "",
  targetRole: "",
  yearsExperience: "",
  summary: "",
  workExperience: "",
  education: "",
  skills: "",
  certifications: "",
  languages: "",
  links: "",
  optimizeWithAi: "yes",
  targetCompany: "",
  institutionDetails: "",
  customColor: "",
  imageShape: "circle",
};


// ─── CV scoring ───────────────────────────────────────────────────────────────
//
// Deliberately deterministic rather than asking the model for a number: the
// same CV must always score the same, and every point lost has to map to a
// concrete, actionable fix. An LLM-generated score would drift between runs and
// could not be explained to the applicant.
//
// Weights sum to 100.

const ACTION_VERBS = [
  "achieved", "analysed", "analyzed", "automated", "built", "collaborated",
  "conducted", "coordinated", "created", "delivered", "designed", "developed",
  "directed", "drove", "engineered", "established", "expanded", "generated",
  "grew", "implemented", "improved", "increased", "initiated", "introduced",
  "launched", "led", "maintained", "managed", "mentored", "migrated",
  "negotiated", "operated", "optimised", "optimized", "organised", "organized",
  "oversaw", "planned", "produced", "reduced", "resolved", "restructured",
  "revamped", "scaled", "secured", "simplified", "spearheaded", "streamlined",
  "strengthened", "supervised", "supported", "taught", "trained", "transformed",
  "upgraded", "wrote",
];

export interface ScoreCheck {
  id: string;
  label: string;
  tip: string;
  weight: number;
  passed: boolean;
}

function startsWithActionVerb(bullet: string) {
  const first = bullet.trim().toLowerCase().split(/[^a-z]+/)[0] || "";
  return ACTION_VERBS.includes(first);
}

function scoreResume(resume: GeneratedResume): {
  score: number;
  checks: ScoreCheck[];
} {
  const text = (v?: string) => (v || "").trim();
  const experience = (resume.experience || []).filter(
    (e) => text(e.role) || text(e.company) || (e.bullets || []).length,
  );
  const bullets = experience
    .flatMap((e) => e.bullets || [])
    .map((b) => text(b))
    .filter(Boolean);
  const summary = text(resume.summary);
  const skills = (resume.skills || []).map((s) => text(s)).filter(Boolean);
  const education = (resume.education || []).filter(
    (e) => text(e.degree) || text(e.institution) || text(e.details),
  );
  const links = (resume.contact?.links || []).map((l) => text(l)).filter(Boolean);

  const verbBullets = bullets.filter(startsWithActionVerb).length;
  const longestBullet = bullets.reduce((max, b) => Math.max(max, b.length), 0);

  const checks: ScoreCheck[] = [
    {
      id: "contact",
      weight: 10,
      label: "Email and phone are both present",
      tip: "Add both an email address and a phone number — a recruiter who cannot reach you cannot hire you.",
      passed: !!text(resume.contact?.email) && !!text(resume.contact?.phone),
    },
    {
      id: "location",
      weight: 4,
      label: "Location is listed",
      tip: "Add your city. Many employers filter candidates by location before reading anything else.",
      passed: !!text(resume.contact?.location),
    },
    {
      id: "headline",
      weight: 5,
      label: "Professional headline is set",
      tip: "Add a job title under your name, e.g. “Senior Software Engineer”. It frames everything below it.",
      passed: !!text(resume.title),
    },
    {
      id: "summary",
      weight: 10,
      label: "Summary is a solid 2–4 sentences",
      tip: !summary
        ? "Add a short professional summary at the top — 2 to 4 sentences on who you are and what you do best."
        : summary.length < 150
          ? "Your summary is very short. Two to four full sentences give a recruiter a reason to keep reading."
          : "Your summary is long enough to be skipped. Tighten it to 2–4 sentences.",
      passed: summary.length >= 150 && summary.length <= 800,
    },
    {
      id: "experience",
      weight: 12,
      label: "Work experience is included",
      tip: "Add at least one role with the employer and what you did there. This is the section employers read first.",
      passed: experience.length > 0,
    },
    {
      id: "dates",
      weight: 6,
      label: "Every role has dates",
      tip: "Add start and end dates to each role. Gaps in dates read as gaps in honesty, even when they are not.",
      passed:
        experience.length > 0 && experience.every((e) => !!text(e.period)),
    },
    {
      id: "bulletCount",
      weight: 8,
      label: "Enough detail under your roles",
      tip: "Write at least three bullet points across your roles. One line per job tells an employer almost nothing.",
      passed: bullets.length >= 3,
    },
    {
      id: "actionVerbs",
      weight: 10,
      label: "Bullets lead with strong verbs",
      tip: "Start each bullet with an action verb — “Led”, “Built”, “Reduced” — instead of “Responsible for” or “Worked on”.",
      passed: bullets.length > 0 && verbBullets / bullets.length >= 0.6,
    },
    {
      id: "quantified",
      weight: 10,
      label: "Achievements are quantified",
      tip: "Put numbers in at least one bullet — team size, users served, time saved, percentage improved. Numbers are what make a claim credible.",
      passed: bullets.some((b) => /\d/.test(b)),
    },
    {
      id: "bulletLength",
      weight: 4,
      label: "Bullets are scannable",
      tip: "One or more bullets run long. Keep each to roughly two lines so the page can be skimmed in seconds.",
      passed: bullets.length > 0 && longestBullet <= 220,
    },
    {
      id: "skills",
      weight: 8,
      label: "Skills section is substantial",
      tip: "List at least five skills. Automated screening tools match on these before a person ever sees your CV.",
      passed: skills.length >= 5,
    },
    {
      id: "education",
      weight: 7,
      label: "Education is included",
      tip: "Add your education — the qualification, the institution and the years.",
      passed: education.length > 0,
    },
    {
      id: "links",
      weight: 3,
      label: "A portfolio or profile link is included",
      tip: "Add a LinkedIn, GitHub or portfolio link. It lets an interested employer verify your work immediately.",
      passed: links.length > 0,
    },
    {
      id: "photo",
      weight: 3,
      label: "Profile photo added",
      tip: "Add a clear professional photo. (Skip this if you are applying somewhere that asks for CVs without photos.)",
      passed: !!text(resume.photoUrl),
    },
  ];

  const score = checks.reduce((sum, c) => sum + (c.passed ? c.weight : 0), 0);
  return { score, checks };
}

function scoreBand(score: number) {
  if (score >= 90) return { label: "Excellent", color: "#16a34a" };
  if (score >= 75) return { label: "Strong", color: "#65a30d" };
  if (score >= 50) return { label: "Getting there", color: "#d97706" };
  return { label: "Needs work", color: "#dc2626" };
}

function ResumeScoreCard({ resume }: { resume: GeneratedResume }) {
  const [showPassed, setShowPassed] = useState(false);
  const { score, checks } = useMemo(() => scoreResume(resume), [resume]);
  const band = scoreBand(score);

  // Biggest wins first - the applicant should fix the 12-point gap before the
  // 3-point one.
  const todo = checks
    .filter((c) => !c.passed)
    .sort((a, b) => b.weight - a.weight);
  const done = checks.filter((c) => c.passed);

  return (
    <div className="glass p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            📊 CV strength
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            {done.length} of {checks.length} checks passed
          </p>
        </div>
        <div className="text-right shrink-0">
          <div
            className="text-2xl font-bold leading-none"
            style={{ color: band.color }}
          >
            {score}%
          </div>
          <div
            className="text-[11px] font-semibold uppercase tracking-wider mt-1"
            style={{ color: band.color }}
          >
            {band.label}
          </div>
        </div>
      </div>

      <div
        className="h-2 w-full rounded-full overflow-hidden"
        style={{ background: "var(--divider)" }}
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, background: band.color }}
        />
      </div>

      {todo.length > 0 ? (
        <div className="flex flex-col gap-2 mt-1">
          <p
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Recommendations
          </p>
          {todo.map((c) => (
            <div key={c.id} className="flex gap-2.5 items-start">
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 mt-[2px]"
                style={{
                  background: "var(--glass-bg-subtle)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--divider)",
                }}
                title={`Worth ${c.weight} points`}
              >
                +{c.weight}
              </span>
              <span
                className="text-xs leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {c.tip}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p
          className="text-xs px-3 py-2 rounded-lg mt-1"
          style={{
            background: "var(--success-bg)",
            color: "var(--success-text)",
            border: "1px solid var(--success-border)",
          }}
        >
          ✓ Every check passed. This CV is ready to send.
        </p>
      )}

      {done.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowPassed((v) => !v)}
            className="text-xs font-medium hover:opacity-70 transition-opacity"
            style={{ color: "var(--text-muted)" }}
          >
            {showPassed ? "Hide" : "Show"} what is already good ({done.length})
          </button>
          {showPassed && (
            <ul className="flex flex-col gap-1.5 mt-2">
              {done.map((c) => (
                <li
                  key={c.id}
                  className="text-xs flex gap-2 items-start"
                  style={{ color: "var(--text-muted)" }}
                >
                  <span style={{ color: "#16a34a" }}>✓</span>
                  <span>{c.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <p className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>
        A guide, not a verdict — it checks structure and completeness, not
        whether you are right for the job.
      </p>
    </div>
  );
}

function FormField({
  label,
  required,
  optional,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        className="text-sm font-medium"
        style={{ color: "var(--text-secondary)" }}
      >
        {label}{" "}
        {required && <span style={{ color: "var(--error-text)" }}>*</span>}
        {optional && (
          <span style={{ color: "var(--text-muted)" }}>(optional)</span>
        )}
      </label>
      {children}
    </div>
  );
}

function ResumeBuilder({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState<ResumeForm>(EMPTY_RESUME_FORM);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resume, setResume] = useState<GeneratedResume | null>(null);
  const [step, setStep] = useState(0);
  const [builderMode, setBuilderMode] = useState<"select" | "ai" | "manual" | "cover-letter">(
    "select",
  );
  const [slideDir, setSlideDir] = useState<"left" | "right">("left");
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const [showSettings, setShowSettings] = useState(false);

  // Off-screen, always-mounted copy of the preview rendered at true A4 width.
  // The visible preview is scaled down to fit its column, so capturing that
  // node directly would bake the scale factor into the PDF. Capturing this one
  // means the download matches the preview regardless of which mode or tab is
  // currently showing.
  const captureRef = useRef<HTMLDivElement>(null);

  // AI polish. preEnhanceResume is the undo buffer - a one-click rewrite of
  // someone's CV needs a one-click way back.
  const [enhancing, setEnhancing] = useState(false);
  const [enhanceInstruction, setEnhanceInstruction] = useState("");
  const [enhanceNote, setEnhanceNote] = useState<string | null>(null);
  const [preEnhanceResume, setPreEnhanceResume] =
    useState<GeneratedResume | null>(null);

  const update = (field: keyof ResumeForm, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const STEPS = [
    { label: "Template", icon: "📄" },
    { label: "Personal Info", icon: "👤" },
    { label: "Experience", icon: "💼" },
    { label: "Skills & Extras", icon: "🎯" },
    { label: "Review", icon: "🔍" },
    { label: "AI Optimization", icon: "✨" },
  ];

  // Per-step validation
  function canProceed(): boolean {
    if (step === 0) return true;
    if (step === 1) return !!(form.fullName.trim() && form.targetRole.trim());
    if (step === 2) return !!form.workExperience.trim();
    return true;
  }

  function goNext() {
    if (!canProceed()) return;
    setSlideDir("left");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setSlideDir("right");
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleGenerate(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/jobs/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate resume");
      const generated = data.resume as GeneratedResume;
      generated.photoUrl = form.photoUrl;
      setResume(generated);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // Single call site for the polish endpoint, shared by the Polish button and
  // by the manual download path. Throws on failure so each caller can decide
  // whether that is fatal.
  async function requestEnhance(current: GeneratedResume) {
    const res = await fetch("/api/jobs/resume/enhance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resume: current,
        instruction: enhanceInstruction.trim() || undefined,
        targetRole: form.targetRole || undefined,
        // Where the CV is going. Context for tailoring emphasis and vocabulary
        // - the route's prompt still forbids inventing anything.
        targetCompany: form.targetCompany.trim() || undefined,
        institutionDetails: form.institutionDetails.trim() || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not enhance the resume.");
    return {
      improved: data.resume as GeneratedResume,
      summary: (data.summary as string | undefined) || null,
    };
  }

  async function handleEnhance() {
    const current = resume ?? mapFormToResume();
    setEnhancing(true);
    setError(null);
    setEnhanceNote(null);
    try {
      const { improved, summary } = await requestEnhance(current);
      setPreEnhanceResume(current);
      setResume(improved);
      setEnhanceNote(summary);
      setEnhanceInstruction("");
    } catch (e: any) {
      setError(e.message || "Could not enhance the resume. Please try again.");
    } finally {
      setEnhancing(false);
    }
  }

  function handleUndoEnhance() {
    if (!preEnhanceResume) return;
    setResume(preEnhanceResume);
    setPreEnhanceResume(null);
    setEnhanceNote(null);
  }

  async function handleDownload() {
    setDownloading(true);
    setError(null);
    try {
      // The capture node may have just been handed new content; let it paint.
      await nextPaint();
      await downloadResumePdfFromNode(
        captureRef.current,
        resumeFileName(resume?.name || form.fullName),
      );
    } catch (e: any) {
      setError(e.message || "Could not generate the PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  // Final wizard step: optimize only. Downloading happens on the next screen,
  // so the applicant can actually see what the AI changed before committing to
  // a file. Setting `resume` is what advances to that screen.
  //
  // Optimization is best-effort: if the AI service is down or unconfigured we
  // still advance with the original wording rather than trapping the user in
  // the wizard - they can download as-is, or retry Polish from there.
  async function handleOptimize() {
    setError(null);
    setEnhanceNote(null);

    const base = mapFormToResume();

    if (form.optimizeWithAi === "no") {
      setResume(base);
      return;
    }

    setEnhancing(true);
    try {
      const { improved, summary } = await requestEnhance(base);
      setPreEnhanceResume(base);
      setResume(improved);
      setEnhanceNote(summary || "Wording and grammar polished.");
    } catch (e: any) {
      setError(
        `${e?.message || "Could not optimize the resume."} Your original wording is shown instead - you can download it, or try Polish again below.`,
      );
      setResume(base);
    } finally {
      setEnhancing(false);
    }
  }

  // Secondary download: real selectable text, so applicant tracking systems can
  // parse it. It does not carry the template styling - see downloadAtsResumePdf.
  async function handleDownloadAts() {
    setDownloading(true);
    setError(null);
    try {
      await downloadAtsResumePdf(resume ?? mapFormToResume(), form.template);
    } catch (e: any) {
      setError(e.message || "Could not generate the PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  const mapFormToResume = (): GeneratedResume => {
    const isFormEmpty =
      !form.fullName &&
      !form.targetRole &&
      !form.email &&
      !form.phone &&
      !form.location &&
      !form.summary &&
      !form.workExperience &&
      !form.education &&
      !form.skills &&
      !form.certifications &&
      !form.languages &&
      !form.links &&
      !form.photoUrl;

    if (isFormEmpty) {
      return {
        name: "Your Name",
        title: "Software Engineer",
        photoUrl:
          "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80",
        contact: {
          email: "example@gmail.com",
          phone: "+1 2345 6789",
          location: "#1 road, city/state-0011",
          links: [],
        },
        summary:
          "I am a software engineer with experience in a variety of programming languages and a track record of delivering high-quality code. I am skilled in problem-solving and have a strong background in computer science. I am a strong communicator and enjoy working collaboratively with others.",
        experience: [
          {
            role: "Senior Software Developer",
            company: "Company - Country",
            period: "Jan 2022 - Dec 2023",
            bullets: [
              "Developed and maintained software using Java, Python, and C++",
              "Led cross-functional teams to deliver successful software projects",
              "write a work experience of a senior software engineer in bullet points",
            ],
          },
          {
            role: "Web Developer",
            company: "Company - Country",
            period: "Jan 2021 - Dec 2021",
            bullets: [
              "Developed and maintained various web applications using languages such as HTML, CSS, JavaScript, and PHP",
              "Worked with cross-functional teams to gather requirements and design user interfaces",
            ],
          },
        ],
        education: [
          {
            degree: "Masters in Software Engineering",
            institution: "XYX University, Bangalore",
            period: "Jan 2019 - Dec 2020",
          },
          {
            degree: "Bachelor in Computer Science",
            institution: "XYX University, Bangalore",
            period: "Jan 2015 - Dec 2018",
          },
        ],
        skills: [
          "SQL Database Management",
          "Linux/Unix Command line",
          "Python",
          "C++",
          "JAVA",
        ],
        languages: ["English: Proficient", "Hindi: Proficient"],
        certifications: ["Writing", "Cricket", "Music"], // Mapped to hobbies in classic template
      };
    }

    return {
      name: form.fullName,
      title: form.targetRole,
      photoUrl: form.photoUrl,
      contact: {
        email: form.email,
        phone: form.phone,
        location: form.location,
        links: form.links
          ? form.links
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
      },
      summary: form.summary,
      experience: form.workExperience
        ? [
            {
              role: "Experience",
              company: form.yearsExperience
                ? `${form.yearsExperience} Years`
                : "",
              period: "",
              bullets: form.workExperience.split("\n").filter((s) => s.trim()),
            },
          ]
        : [],
      education: form.education
        ? [
            {
              degree: "Education",
              institution: "",
              period: "",
              details: form.education,
            },
          ]
        : [],
      skills: form.skills
        ? form.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      certifications: form.certifications
        ? form.certifications
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      languages: form.languages
        ? form.languages
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    };
  };

  // Hands the finished resume over to the cover letter page. sessionStorage
  // rather than a query string: a job description and a list of highlights are
  // far too long for a URL, and none of it belongs in browser history.
  function seedCoverLetter() {
    const source = resume ?? mapFormToResume();
    const highlights = [
      source.summary,
      ...(source.experience || []).flatMap((e) => e.bullets || []),
    ]
      .map((s) => (s || "").trim())
      .filter(Boolean)
      .join("\n");

    try {
      sessionStorage.setItem(
        "gg:coverLetterSeed",
        JSON.stringify({
          fullName: source.name || form.fullName,
          email: source.contact?.email || form.email,
          phone: source.contact?.phone || form.phone,
          location: source.contact?.location || form.location,
          roleTitle: source.title || form.targetRole,
          company: form.targetCompany,
          jobDescription: form.institutionDetails,
          highlights,
        }),
      );
    } catch {
      // Private browsing can refuse sessionStorage; the page still works, it
      // just starts empty.
    }
  }

  // Summary helper for review step
  const selectedTemplate = RESUME_TEMPLATES.find((t) => t.id === form.template);
  const reviewSections = [
    {
      label: "Template",
      value: selectedTemplate
        ? `${selectedTemplate.icon} ${selectedTemplate.label}`
        : form.template,
    },
    { label: "Photo", value: form.photoUrl ? "Uploaded" : "None" },
    { label: "Full Name", value: form.fullName },
    { label: "Target Role", value: form.targetRole },
    { label: "Email", value: form.email },
    { label: "Phone", value: form.phone },
    { label: "Location", value: form.location },
    { label: "Years of Experience", value: form.yearsExperience },
    { label: "Summary", value: form.summary },
    { label: "Work Experience", value: form.workExperience },
    { label: "Education", value: form.education },
    { label: "Skills", value: form.skills },
    { label: "Certifications", value: form.certifications },
    { label: "Languages", value: form.languages },
    { label: "Links", value: form.links },
    {
      label: "AI optimization",
      value:
        form.optimizeWithAi === "yes"
          ? "On"
          : "Off - your wording is kept exactly as written",
    },
    { label: "Submitting to", value: form.targetCompany },
  ];

  // Two-column layout (controls left, sticky preview right) applies to the
  // manual builder AND to the finished-resume screen. That screen used to
  // stack the preview underneath the action bar in a single narrow column,
  // which pushed the CV far below the fold.
  const splitView = builderMode === "manual" || !!resume;

  if (builderMode === "select") {
    return (
      <div
        className="max-w-3xl mx-auto px-4 py-8"
        style={{ animation: "fade-up 0.35s ease both" }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium mb-6 hover:opacity-70 transition-opacity"
          style={{ color: "var(--text-muted)" }}
        >
          ← Back to Jobs
        </button>
        <div className="mb-8">
          <h1
            className="text-3xl font-bold mb-2 flex items-center gap-2"
            style={{ color: "var(--text-primary)" }}
          >
            <span>📄</span> Create Your Resume & Cover Letter
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Choose how you want to build your document.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => setBuilderMode("ai")}
            className="glass p-6 rounded-2xl flex flex-col items-start gap-4 hover:border-[var(--purple)] transition-all text-left"
          >
            <span className="text-3xl">✨</span>
            <div>
              <h3
                className="font-bold text-lg mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                Build with AI
              </h3>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Let AI write your professional summary and polish your
                experience points.
              </p>
            </div>
          </button>
          <button
            onClick={() => setBuilderMode("manual")}
            className="glass p-6 rounded-2xl flex flex-col items-start gap-4 hover:border-[var(--blue)] transition-all text-left"
          >
            <span className="text-3xl">✍️</span>
            <div>
              <h3
                className="font-bold text-lg mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                Choose a Template
              </h3>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Write it yourself with a live preview of your chosen template.
              </p>
            </div>
          </button>
          <Link
            href="/jobs/cover-letter"
            className="glass p-6 rounded-2xl flex flex-col items-start gap-4 hover:border-[var(--green)] transition-all text-left"
          >
            <span className="text-3xl">✉️</span>
            <div>
              <h3
                className="font-bold text-lg mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                Write Cover Letter
              </h3>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Let AI write a letter aimed at the role you are applying for.
              </p>
            </div>
          </Link>
        </div>
      </div>
    );
  }

  // The cover letter lives on its own route (/jobs/cover-letter) now, so the
  // "under construction" placeholder that used to sit here is gone. The
  // builderMode value is kept only so any older link that still sets it lands
  // somewhere sensible rather than rendering a blank wizard.
  if (builderMode === "cover-letter") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center" style={{ animation: "fade-up 0.35s ease both" }}>
        <span className="text-6xl mb-6 block">✉️</span>
        <h2 className="text-3xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
          Cover Letter Builder
        </h2>
        <p className="text-lg mb-8" style={{ color: "var(--text-muted)" }}>
          The cover letter builder has moved to its own page.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={() => setBuilderMode("select")}
            className="btn-secondary px-6 py-3 rounded-lg font-semibold"
          >
            ← Back to Options
          </button>
          <Link
            href="/jobs/cover-letter"
            className="btn-primary px-8 py-3 rounded-lg font-semibold"
          >
            Open Cover Letter Builder →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`mx-auto px-4 py-8 ${splitView ? "max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start" : "max-w-3xl"}`}
      style={{ animation: "fade-up 0.35s ease both" }}
    >
      {splitView && (
        <div className="col-span-1 lg:col-span-2 flex items-center justify-between mb-4 gap-2">
          {/* Mobile Toggle */}
          <div className="lg:hidden flex p-1 rounded-lg border w-full max-w-[200px]" style={{ background: "var(--glass-bg)", borderColor: "var(--divider)" }}>
            <button
              onClick={() => setMobileTab("edit")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                mobileTab === "edit" ? "bg-white text-black shadow-sm" : "text-[var(--text-secondary)] hover:bg-white/5"
              }`}
            >
              {resume ? "Options" : "Edit Info"}
            </button>
            <button
              onClick={() => setMobileTab("preview")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                mobileTab === "preview" ? "bg-[var(--purple)] text-white shadow-sm" : "text-[var(--text-secondary)] hover:bg-white/5"
              }`}
            >
              Preview CV
            </button>
          </div>

          {/* Desktop Spacer */}
          <div className="hidden lg:block flex-1" />

          {/* Toolbar */}
          <div className={`flex items-center gap-2 ml-auto ${mobileTab === 'edit' ? 'hidden lg:flex' : 'flex'}`}>
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-xl bg-white shadow-sm hover:shadow-md transition-all border border-gray-200 text-gray-700"
              >
                <Settings size={18} />
              </button>
              {showSettings && (
                <div className="absolute top-full right-0 mt-2 p-4 bg-white rounded-xl shadow-xl border border-gray-100 z-50 w-64 flex flex-col gap-4">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">Theme Color</span>
                    <div className="flex flex-wrap gap-2">
                      {["", "#7b5ade", "#dc2626", "#059669", "#2563eb", "#ea580c"].map(c => (
                        <button key={c || "default"} onClick={() => update("customColor", c)} className={`w-8 h-8 rounded-full border-2 ${form.customColor === c ? 'border-gray-800' : 'border-transparent'} relative flex items-center justify-center`} style={{ backgroundColor: c || "var(--text-muted)" }}>
                          {!c && <span className="text-white text-[10px] font-bold">Def</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">Photo Shape</span>
                    <div className="flex gap-2">
                      <button onClick={() => update("imageShape", "circle")} className={`flex-1 py-1.5 text-xs font-medium rounded-lg border ${form.imageShape === 'circle' || !form.imageShape ? 'bg-gray-100 border-gray-300' : 'border-gray-200 text-gray-600'}`}>Circle</button>
                      <button onClick={() => update("imageShape", "rounded")} className={`flex-1 py-1.5 text-xs font-medium rounded-lg border ${form.imageShape === 'rounded' ? 'bg-gray-100 border-gray-300' : 'border-gray-200 text-gray-600'}`}>Rounded</button>
                      <button onClick={() => update("imageShape", "square")} className={`flex-1 py-1.5 text-xs font-medium rounded-lg border ${form.imageShape === 'square' ? 'bg-gray-100 border-gray-300' : 'border-gray-200 text-gray-600'}`}>Square</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Downloading only becomes available once a resume exists - that
                is, after the AI Optimization step. Before then the CV has not
                been through the optimization choice yet, so handing out a file
                would defeat the flow. The button stays visible but disabled so
                it is discoverable. */}
            <button
              onClick={handleDownload}
              disabled={downloading || !resume}
              title={
                resume
                  ? "Download your CV"
                  : `Available after the ${STEPS[STEPS.length - 1].label} step`
              }
              className="px-3 py-2 rounded-xl bg-[var(--purple)] text-white shadow-sm hover:shadow-md transition-all font-semibold flex items-center gap-1.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-sm"
            >
              {downloading ? "Wait..." : <><Download size={16} /> <span className="hidden sm:inline">Download</span></>}
            </button>
          </div>
        </div>
      )}

      <div className={`flex flex-col ${splitView && mobileTab === "preview" ? "hidden lg:flex" : "flex"}`}>
        <style>{`
        @keyframes rb-slide-left {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes rb-slide-right {
          from { opacity: 0; transform: translateX(-40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .rb-slide-left  { animation: rb-slide-left  0.3s ease both; }
        .rb-slide-right { animation: rb-slide-right 0.3s ease both; }
      `}</style>

        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium mb-6 hover:opacity-70 transition-opacity"
          style={{ color: "var(--text-muted)" }}
        >
          ← Back to Jobs
        </button>

        {!resume ? (
          <>
            {/* ── Stepper ── */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                {STEPS.map((s, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-1.5 flex-1"
                    style={{ cursor: i <= step ? "pointer" : "default" }}
                    onClick={() => {
                      if (i < step) {
                        setSlideDir(i < step ? "right" : "left");
                        setStep(i);
                      }
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold transition-all duration-300"
                      style={{
                        background:
                          i <= step
                            ? "linear-gradient(135deg, var(--purple), var(--blue))"
                            : "var(--glass-bg)",
                        color: i <= step ? "#fff" : "var(--text-muted)",
                        border: i <= step ? "none" : "2px solid var(--divider)",
                        boxShadow:
                          i === step
                            ? "0 0 0 4px color-mix(in srgb, var(--purple) 25%, transparent)"
                            : "none",
                      }}
                    >
                      {i < step ? "✓" : s.icon}
                    </div>
                    <span
                      className="text-[11px] font-semibold text-center leading-tight hidden sm:block"
                      style={{
                        color:
                          i <= step
                            ? "var(--text-primary)"
                            : "var(--text-muted)",
                      }}
                    >
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
              {/* Progress bar */}
              <div
                className="h-1 rounded-full overflow-hidden"
                style={{ background: "var(--divider)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${((step + 1) / STEPS.length) * 100}%`,
                    background:
                      "linear-gradient(90deg, var(--purple), var(--blue))",
                  }}
                />
              </div>
            </div>

            {/* ── Step Content ── */}
            <div className="glass p-8">
              <div
                key={step}
                className={
                  slideDir === "left" ? "rb-slide-left" : "rb-slide-right"
                }
              >
                {/* Step 0: Personal Info */}
                {step === 0 && (
                  <div className="flex flex-col gap-5">
                    <p
                      className="text-xs font-semibold uppercase tracking-wider mb-1"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Step 1 — Choose a Template
                    </p>

                    {/* Template Selector */}
                    {builderMode === "manual" && (
                      <div>
                        <p
                          className="text-sm font-medium mb-3"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Choose a template
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {RESUME_TEMPLATES.map((t) => (
                            <button
                              key={t.id}
                              onClick={() => {
                                update("template", t.id);
                                setMobileTab("preview");
                              }}
                              className="relative rounded-xl p-4 text-left transition-all duration-200 group"
                              style={{
                                background:
                                  form.template === t.id
                                    ? `color-mix(in srgb, ${t.accent} 12%, transparent)`
                                    : "var(--glass-bg)",
                                border:
                                  form.template === t.id
                                    ? `2px solid ${t.accent}`
                                    : "2px solid var(--divider)",
                                boxShadow:
                                  form.template === t.id
                                    ? `0 0 0 3px color-mix(in srgb, ${t.accent} 15%, transparent)`
                                    : "none",
                              }}
                            >
                              {form.template === t.id && (
                                <span
                                  className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold"
                                  style={{ background: t.accent }}
                                >
                                  ✓
                                </span>
                              )}
                              <span className="text-xl mb-1.5 block">
                                {t.icon}
                              </span>
                              <span
                                className="text-sm font-semibold block"
                                style={{
                                  color:
                                    form.template === t.id
                                      ? t.accent
                                      : "var(--text-primary)",
                                }}
                              >
                                {t.label}
                              </span>
                              <span
                                className="text-[11px] block mt-0.5"
                                style={{ color: "var(--text-muted)" }}
                              >
                                {t.desc}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 1: Personal Info */}
                {step === 1 && (
                  <div className="flex flex-col gap-5">
                    <p
                      className="text-xs font-semibold uppercase tracking-wider mb-1"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Step 2 — Personal Information
                    </p>
                    <div className="mb-4">
                      <ProfileUpload
                        folder="resumes"
                        currentImage={form.photoUrl}
                        onUploadComplete={(url) => update("photoUrl", url)}
                        onRemove={() => update("photoUrl", "")}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField label="Full Name" required>
                        <input
                          type="text"
                          value={form.fullName}
                          onChange={(e) => update("fullName", e.target.value)}
                          placeholder="John Doe"
                          className="glass-input w-full px-4 py-2.5 text-sm"
                        />
                      </FormField>
                      <FormField label="Target Role" required>
                        <input
                          type="text"
                          value={form.targetRole}
                          onChange={(e) => update("targetRole", e.target.value)}
                          placeholder="e.g. Senior Frontend Engineer"
                          className="glass-input w-full px-4 py-2.5 text-sm"
                        />
                      </FormField>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField label="Email" optional>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => update("email", e.target.value)}
                          placeholder="john@example.com"
                          className="glass-input w-full px-4 py-2.5 text-sm"
                        />
                      </FormField>
                      <FormField label="Phone" optional>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => update("phone", e.target.value)}
                          placeholder="+237 6 00 00 00 00"
                          className="glass-input w-full px-4 py-2.5 text-sm"
                        />
                      </FormField>
                      <FormField label="Location" optional>
                        <input
                          type="text"
                          value={form.location}
                          onChange={(e) => update("location", e.target.value)}
                          placeholder="e.g. Yaoundé, Cameroon"
                          className="glass-input w-full px-4 py-2.5 text-sm"
                        />
                      </FormField>
                    </div>
                  </div>
                )}

                {/* Step 2: Experience & Background */}
                {step === 2 && (
                  <div className="flex flex-col gap-5">
                    <p
                      className="text-xs font-semibold uppercase tracking-wider mb-1"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Step 3 — Experience & Background
                    </p>
                    <FormField label="Years of Experience" optional>
                      <input
                        type="text"
                        value={form.yearsExperience}
                        onChange={(e) =>
                          update("yearsExperience", e.target.value)
                        }
                        placeholder="e.g. 5"
                        className="glass-input w-full px-4 py-2.5 text-sm"
                      />
                    </FormField>
                    <FormField label="Professional Summary" optional>
                      <textarea
                        value={form.summary}
                        onChange={(e) => update("summary", e.target.value)}
                        rows={3}
                        placeholder="A rough summary of who you are — the AI will polish it."
                        className="glass-input w-full px-4 py-3 text-sm resize-none"
                      />
                    </FormField>
                    <FormField label="Work Experience" required>
                      <textarea
                        value={form.workExperience}
                        onChange={(e) =>
                          update("workExperience", e.target.value)
                        }
                        rows={7}
                        placeholder={`List roles, companies, dates and what you did — rough notes are fine.\n\nExample:\nFrontend Developer, Acme Corp (2021 - Present)\n- Built the customer dashboard in React\n- Led migration to TypeScript\n\nJunior Developer, StartupXYZ (2019 - 2021)\n- Maintained the marketing site`}
                        className="glass-input w-full px-4 py-3 text-sm resize-none"
                      />
                    </FormField>
                    <FormField label="Education" optional>
                      <textarea
                        value={form.education}
                        onChange={(e) => update("education", e.target.value)}
                        rows={3}
                        placeholder={`e.g. B.Sc. Computer Science, University of Yaoundé I (2015 - 2019)`}
                        className="glass-input w-full px-4 py-3 text-sm resize-none"
                      />
                    </FormField>
                  </div>
                )}

                {/* Step 3: Skills & Extras */}
                {step === 3 && (
                  <div className="flex flex-col gap-5">
                    <p
                      className="text-xs font-semibold uppercase tracking-wider mb-1"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Step 4 — Skills & Extras
                    </p>
                    <FormField label="Skills" optional>
                      <input
                        type="text"
                        value={form.skills}
                        onChange={(e) => update("skills", e.target.value)}
                        placeholder="e.g. React, TypeScript, Node.js (comma-separated)"
                        className="glass-input w-full px-4 py-2.5 text-sm"
                      />
                    </FormField>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField label="Certifications" optional>
                        <input
                          type="text"
                          value={form.certifications}
                          onChange={(e) =>
                            update("certifications", e.target.value)
                          }
                          placeholder="e.g. AWS Certified, PMP"
                          className="glass-input w-full px-4 py-2.5 text-sm"
                        />
                      </FormField>
                      <FormField label="Languages" optional>
                        <input
                          type="text"
                          value={form.languages}
                          onChange={(e) => update("languages", e.target.value)}
                          placeholder="e.g. English, French"
                          className="glass-input w-full px-4 py-2.5 text-sm"
                        />
                      </FormField>
                    </div>
                    <FormField
                      label="Links (portfolio, LinkedIn, GitHub)"
                      optional
                    >
                      <input
                        type="text"
                        value={form.links}
                        onChange={(e) => update("links", e.target.value)}
                        placeholder="e.g. github.com/you, linkedin.com/in/you"
                        className="glass-input w-full px-4 py-2.5 text-sm"
                      />
                    </FormField>
                  </div>
                )}

                {/* Step 4: Review */}
                {step === 4 && (
                  <div className="flex flex-col gap-5">
                    <p
                      className="text-xs font-semibold uppercase tracking-wider mb-1"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Step 5 — Review Your Details
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Check everything below. You can go back to any step to
                      make edits — the last step decides how AI should handle
                      your CV before it downloads.
                    </p>
                    <div
                      className="rounded-xl p-5 flex flex-col gap-3"
                      style={{
                        background: "var(--glass-bg)",
                        border: "1px solid var(--divider)",
                      }}
                    >
                      {reviewSections
                        .filter((r) => r.value?.trim())
                        .map((r) => (
                          <div key={r.label} className="flex flex-col gap-0.5">
                            <span
                              className="text-[11px] font-semibold uppercase tracking-wider"
                              style={{ color: "var(--text-muted)" }}
                            >
                              {r.label}
                            </span>
                            <span
                              className="text-sm whitespace-pre-line"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {r.value}
                            </span>
                          </div>
                        ))}
                      {reviewSections.every((r) => !r.value?.trim()) && (
                        <p
                          className="text-sm italic"
                          style={{ color: "var(--text-muted)" }}
                        >
                          No details filled in yet. Go back to add your
                          information.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 5: AI optimization - the last gate before the CV can
                    be downloaded, so the choice is always made deliberately. */}
                {step === 5 && (
                  <div className="flex flex-col gap-5">
                    <p
                      className="text-xs font-semibold uppercase tracking-wider mb-1"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Step 6 — AI Optimization
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {builderMode === "ai"
                        ? "Last step. Tell the AI where this CV is going so it can aim your resume before generating it."
                        : "Last step. Choose whether AI should refine your CV. You will see the result and download it on the next screen."}
                    </p>

                    {builderMode === "manual" && (
                    <div
                      className="rounded-xl p-5 flex flex-col gap-4"
                      style={{
                        background: "var(--glass-bg)",
                        border: "1px solid var(--divider)",
                      }}
                    >
                      <div>
                        <span
                          className="text-sm font-semibold block"
                          style={{ color: "var(--text-primary)" }}
                        >
                          ✨ Optimize this CV with AI?
                        </span>
                        <span
                          className="text-xs mt-1 block"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Fixes grammar, tightens wording and aims the CV at the
                          place you are applying to. It never invents employers,
                          dates, degrees or numbers.
                        </span>
                      </div>

                      <div className="flex gap-2">
                        {(["yes", "no"] as const).map((choice) => (
                          <button
                            key={choice}
                            type="button"
                            onClick={() => update("optimizeWithAi", choice)}
                            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg border transition-all ${
                              form.optimizeWithAi === choice
                                ? "bg-[var(--purple)] text-white border-transparent shadow-sm"
                                : "border-[var(--divider)] text-[var(--text-secondary)] hover:bg-white/5"
                            }`}
                          >
                            {choice === "yes"
                              ? "Yes, optimize it"
                              : "No, keep my wording"}
                          </button>
                        ))}
                      </div>
                    </div>
                    )}

                    {builderMode === "ai" || form.optimizeWithAi === "yes" ? (
                      <div
                        className="rounded-xl p-5 flex flex-col gap-4"
                        style={{
                          background: "var(--glass-bg)",
                          border: "1px solid var(--divider)",
                        }}
                      >
                        <div>
                          <span
                            className="text-sm font-semibold block"
                            style={{ color: "var(--text-primary)" }}
                          >
                            Where is this CV going?
                          </span>
                          <span
                            className="text-xs mt-1 block"
                            style={{ color: "var(--text-muted)" }}
                          >
                            The more you give here, the better the CV is aimed.
                            Both fields are optional — leave them blank for a
                            general polish.
                          </span>
                        </div>

                        <FormField
                          label="Institution or company"
                          optional
                        >
                          <input
                            type="text"
                            value={form.targetCompany}
                            onChange={(e) =>
                              update("targetCompany", e.target.value)
                            }
                            placeholder="e.g. University of Yaoundé I, MTN Cameroon, UNICEF"
                            className="glass-input w-full px-4 py-2.5 text-sm"
                          />
                        </FormField>

                        <FormField
                          label="Details about the role or institution"
                          optional
                        >
                          <textarea
                            value={form.institutionDetails}
                            onChange={(e) =>
                              update("institutionDetails", e.target.value)
                            }
                            rows={6}
                            placeholder="Paste the job posting here, or describe the department, the responsibilities and what they are looking for."
                            className="glass-input w-full px-4 py-2.5 text-sm resize-y"
                          />
                        </FormField>

                        <p
                          className="text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          This is used to decide what to emphasise and which
                          words to use. Nothing you did not write yourself will
                          be added to your CV.
                        </p>
                      </div>
                    ) : (
                      <p
                        className="text-sm px-4 py-3 rounded-lg"
                        style={{
                          background: "var(--glass-bg)",
                          border: "1px solid var(--divider)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Your CV will be built exactly as you wrote it. Nothing
                        is sent to the AI.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <p
                  className="text-sm px-4 py-3 rounded-lg mt-5"
                  style={{
                    background: "var(--error-bg)",
                    color: "var(--error-text)",
                    border: "1px solid var(--error-border)",
                  }}
                >
                  ⚠ {error}
                </p>
              )}

              {/* ── Navigation Buttons ── */}
              <div
                className="flex gap-3 pt-6 mt-2"
                style={{ borderTop: "1px solid var(--divider)" }}
              >
                {step === 0 ? (
                  <button
                    type="button"
                    onClick={onBack}
                    className="btn-secondary flex-1 px-4 py-3 text-sm font-medium"
                  >
                    Cancel
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={goBack}
                    className="btn-secondary flex-1 px-4 py-3 text-sm font-medium"
                  >
                    ← Back
                  </button>
                )}

                {step < STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!canProceed()}
                    className="btn-primary flex-1 px-4 py-3 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                ) : builderMode === "manual" ? (
                  <button
                    type="button"
                    onClick={handleOptimize}
                    disabled={enhancing || !canProceed()}
                    title={
                      form.optimizeWithAi === "yes"
                        ? "Aims your CV at the institution you named, then shows you the result. It will not invent employers, dates or numbers."
                        : "Builds your CV from what you typed, with no AI rewriting."
                    }
                    className="btn-primary flex-1 px-4 py-3 text-sm font-semibold disabled:opacity-70"
                  >
                    {enhancing
                      ? "Optimizing…"
                      : form.optimizeWithAi === "yes"
                        ? "Optimize ✨"
                        : "Continue →"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleGenerate()}
                    disabled={loading || !canProceed()}
                    className="btn-primary flex-1 px-4 py-3 text-sm font-semibold disabled:opacity-70"
                  >
                    {loading ? "Generating…" : "Generate Resume ✨"}
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Action bar */}
            <div className="glass p-4 flex flex-col gap-3">
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                ✓ Your resume is ready. Check the preview, then download.
              </p>
              {/* Wraps rather than squeezing: this bar now sits in the narrower
                  left column beside the preview. */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setResume(null);
                    setStep(0);
                  }}
                  className="btn-secondary px-4 py-2.5 text-sm font-semibold rounded-lg"
                >
                  Edit details
                </button>
                <button
                  onClick={() => handleGenerate()}
                  disabled={loading}
                  className="btn-secondary px-4 py-2.5 text-sm font-semibold rounded-lg disabled:opacity-70"
                >
                  {loading ? "Regenerating…" : "Regenerate"}
                </button>
                <button
                  onClick={handleDownloadAts}
                  disabled={downloading}
                  title="Plain-text layout that applicant tracking systems can read. Does not carry the template styling."
                  className="btn-secondary px-4 py-2.5 text-sm font-semibold rounded-lg disabled:opacity-70"
                >
                  ATS copy
                </button>
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="btn-primary px-4 py-2.5 text-sm font-semibold rounded-lg disabled:opacity-70"
                >
                  {downloading ? "Preparing…" : "Download PDF ↓"}
                </button>
              </div>
            </div>

            {/* Score and recommendations, sitting between "here it is" and the
                tool that fixes it. */}
            <ResumeScoreCard resume={resume} />

            {/* Next step in the application, prefilled from this resume. */}
            <Link
              href="/jobs/cover-letter"
              onClick={seedCoverLetter}
              className="glass p-4 flex items-center gap-3 hover:border-[var(--green)] transition-all"
            >
              <span className="text-2xl shrink-0">✉️</span>
              <div className="min-w-0 flex-1">
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Now write a matching cover letter
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  AI writes it from this resume — your details and role carry
                  over.
                </p>
              </div>
              <span
                className="text-sm shrink-0"
                style={{ color: "var(--text-muted)" }}
              >
                →
              </span>
            </Link>

            {/* AI polish */}
            <div className="glass p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    ✨ Polish with AI
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Corrects grammar and spelling, tightens the wording and
                    strengthens weak bullets. It will not invent employers,
                    dates or numbers.
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {preEnhanceResume && (
                    <button
                      onClick={handleUndoEnhance}
                      disabled={enhancing}
                      className="btn-secondary px-4 py-2.5 text-sm font-semibold rounded-lg disabled:opacity-70"
                    >
                      Undo
                    </button>
                  )}
                  <button
                    onClick={handleEnhance}
                    disabled={enhancing}
                    className="btn-primary px-4 py-2.5 text-sm font-semibold rounded-lg disabled:opacity-70"
                  >
                    {enhancing ? "Polishing…" : "Polish"}
                  </button>
                </div>
              </div>

              <input
                value={enhanceInstruction}
                onChange={(e) => setEnhanceInstruction(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !enhancing) handleEnhance();
                }}
                placeholder="Optional: e.g. make it more concise, or aim it at a startup role"
                className="w-full rounded-lg px-3 py-2.5 text-base sm:text-sm outline-none"
                style={{
                  background: "var(--input-bg)",
                  border: "1px solid var(--input-border)",
                  color: "var(--text-primary)",
                }}
              />

              {enhanceNote && (
                <p
                  className="text-xs px-3 py-2 rounded-lg"
                  style={{
                    background: "var(--success-bg)",
                    color: "var(--success-text)",
                    border: "1px solid var(--success-border)",
                  }}
                >
                  ✓ {enhanceNote}
                </p>
              )}
            </div>

            {error && (
              <p
                className="text-sm px-4 py-3 rounded-lg"
                style={{
                  background: "var(--error-bg)",
                  color: "var(--error-text)",
                  border: "1px solid var(--error-border)",
                }}
              >
                ⚠ {error}
              </p>
            )}

            {/* The preview lives in the sticky right-hand column, not here -
                see below. */}
          </div>
        )}
      </div>

      {splitView && (
        <div className={`sticky top-8 w-full flex flex-col gap-3 pb-12 ${mobileTab === 'edit' ? 'hidden lg:flex' : 'flex'}`}>
          <A4ScaleWrapper>
            <ResumePreview
              resume={resume ?? mapFormToResume()}
              template={form.template}
              customColor={form.customColor}
              imageShape={form.imageShape}
            />
          </A4ScaleWrapper>
        </div>
      )}

      {/* Off-screen capture source for the PDF. Rendered at exactly A4 width
          with no transform, so html2canvas gets a clean 1:1 sheet. */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: "-10000px",
          width: `${A4_WIDTH_PX}px`,
          pointerEvents: "none",
          zIndex: -1,
        }}
      >
        <div
          ref={captureRef}
          style={{ width: `${A4_WIDTH_PX}px`, background: "#fff" }}
        >
          <ResumePreview
            resume={resume ?? mapFormToResume()}
            template={form.template}
            customColor={form.customColor}
            imageShape={form.imageShape}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Renders resume content as discrete, whole A4 sheets in a scroller.
 *
 * The document flows continuously; each sheet is a fixed A4 window onto it,
 * offset by exactly one page height. Those are the same offsets the PDF is
 * sliced at, so page 2 here is page 2 in the download.
 *
 * The previous version drew one tall continuous strip inside a container only
 * one page high, which is why a page appeared cut in half.
 */
function A4ScaleWrapper({
  children,
  maxHeight = "calc(100vh - 10rem)",
}: {
  children: React.ReactNode;
  maxHeight?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [contentHeight, setContentHeight] = useState(A4_HEIGHT_PX);

  // Fit a sheet to the column. contentRect already excludes the scrollbar, and
  // GUTTER leaves room for the drop shadow so overflow-x-hidden can't clip it.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const GUTTER = 32;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const usable = Math.max(entry.contentRect.width - GUTTER, 1);
      setScale(Math.min(usable / A4_WIDTH_PX, 1));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Sheet 0 holds the whole document (just clipped), so its height is the
  // document height - that is what decides the page count.
  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setContentHeight(entry.contentRect.height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Same tolerance as the PDF slicer, so the preview never advertises a page
  // the download does not produce.
  const pageCount = countPages(contentHeight);
  const sheetW = A4_WIDTH_PX * scale;
  const sheetH = A4_HEIGHT_PX * scale;

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <span
          className="text-xs font-medium"
          style={{ color: "var(--text-muted)" }}
        >
          A4 · {pageCount} page{pageCount > 1 ? "s" : ""}
        </span>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {Math.round(scale * 100)}%
        </span>
      </div>

      <div
        ref={scrollRef}
        className="w-full overflow-y-auto overflow-x-hidden overscroll-contain rounded-xl"
        style={{
          maxHeight,
          background: "var(--glass-bg-subtle)",
          border: "1px solid var(--glass-border)",
        }}
      >
        <div className="flex flex-col items-center gap-6 py-6">
          {Array.from({ length: pageCount }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div
                className="relative overflow-hidden bg-white shadow-2xl"
                style={{ width: sheetW, height: sheetH }}
              >
                <div
                  className="absolute top-0 left-0 origin-top-left"
                  style={{
                    width: A4_WIDTH_PX,
                    height: A4_HEIGHT_PX,
                    transform: `scale(${scale})`,
                  }}
                >
                  {/* the full document, pulled up by i whole pages */}
                  <div
                    ref={i === 0 ? measureRef : undefined}
                    className="absolute left-0"
                    style={{ top: -i * A4_HEIGHT_PX, width: A4_WIDTH_PX }}
                  >
                    {children}
                  </div>
                </div>
              </div>
              <span
                className="text-[11px] font-medium"
                style={{ color: "var(--text-muted)" }}
              >
                Page {i + 1} of {pageCount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ResumeSectionTitle({
  children,
  template,
}: {
  children: React.ReactNode;
  template?: ResumeTemplate;
}) {
  const accent =
    RESUME_TEMPLATES.find((t) => t.id === template)?.accent || "#7b5ade";

  if (template === "modern") {
    return (
      <div className="mb-3">
        <span
          className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded"
          style={{ color: "#fff", background: accent }}
        >
          {children}
        </span>
      </div>
    );
  }

  if (template === "minimal") {
    return (
      <div className="mb-3 pb-1" style={{ borderBottom: `1px solid #e5e7eb` }}>
        <span
          className="text-[11px] font-medium uppercase tracking-[0.15em]"
          style={{ color: "#555" }}
        >
          {children}
        </span>
      </div>
    );
  }

  if (template === "bold") {
    return (
      <div className="flex items-center gap-3 mb-3">
        <span className="w-1 h-5 rounded-full" style={{ background: accent }} />
        <span
          className="text-sm font-black uppercase tracking-wider"
          style={{ color: "#111" }}
        >
          {children}
        </span>
      </div>
    );
  }

  // classic (default)
  return (
    <div className="flex items-center gap-3 mb-3">
      <span
        className="text-xs font-bold uppercase tracking-wider"
        style={{ color: "#111" }}
      >
        {children}
      </span>
      <span className="h-px flex-1" style={{ background: "#e5e7eb" }} />
    </div>
  );
}

function ResumePreview({
  resume,
  template = "classic",
  customColor,
  imageShape = "circle",
}: {
  resume: GeneratedResume;
  template?: ResumeTemplate;
  customColor?: string;
  imageShape?: "circle" | "square" | "rounded";
}) {
  const contactParts = [
    resume.contact?.email,
    resume.contact?.phone,
    resume.contact?.location,
    ...(resume.contact?.links || []),
  ].filter(Boolean) as string[];
  
  const accent =
    customColor ||
    RESUME_TEMPLATES.find((t) => t.id === template)?.accent ||
    "#7b5ade";

  // Template-specific header styles
  const headerStyles: Record<ResumeTemplate, React.CSSProperties> = {
    classic: {},
    modern: {},
    minimal: {},
    bold: {
      borderLeft: `4px solid ${accent}`,
      paddingLeft: "1rem",
    },
  };

  const nameColor: Record<ResumeTemplate, string> = {
    classic: "#111",
    modern: "#111",
    minimal: "#111",
    bold: "#111",
  };

  const titleColor: Record<ResumeTemplate, string> = {
    classic: accent,
    modern: accent,
    minimal: "#555",
    bold: accent,
  };

  const contactColor: Record<ResumeTemplate, string> = {
    classic: "#555",
    modern: "#555",
    minimal: "#555",
    bold: "#555",
  };

  const shapeClass =
    imageShape === "square"
      ? "rounded-none"
      : imageShape === "rounded"
        ? "rounded-xl"
        : "rounded-full";

  const renderPhoto = (size = "w-24 h-24") =>
    resume.photoUrl && (
      <img
        src={resume.photoUrl}
        alt="Profile"
        className={`${size} ${shapeClass} object-cover border-4`}
        style={{ borderColor: accent }}
      />
    );

  const renderContact = () => {
    if (contactParts.length === 0) return null;
    if (template === "modern") {
      return (
        <div className="flex flex-col gap-1.5 mt-2">
          {contactParts.map((part, i) => (
            <span
              key={i}
              className="text-xs"
              style={{ color: contactColor[template] }}
            >
              {part}
            </span>
          ))}
        </div>
      );
    }
    return (
      <p className="text-xs mt-2" style={{ color: contactColor[template] }}>
        {contactParts.join("  ·  ")}
      </p>
    );
  };

  const renderHeader = () => (
    <div style={headerStyles[template]} className="flex items-center gap-6">
      {renderPhoto()}
      <div>
        <h2
          className={`font-bold ${template === "bold" ? "text-3xl" : "text-2xl"}`}
          style={{ color: nameColor[template] }}
        >
          {resume.name}
        </h2>
        {resume.title && (
          <p
            className={`font-semibold mt-0.5 ${template === "bold" ? "text-base" : "text-sm"}`}
            style={{ color: titleColor[template] }}
          >
            {resume.title}
          </p>
        )}
        {renderContact()}
      </div>
    </div>
  );

  const renderContent = () => (
    <>
      {resume.summary && (
        <div>
          <ResumeSectionTitle template={template}>Summary</ResumeSectionTitle>
          <p className="text-[13px] leading-relaxed" style={{ color: "#333" }}>
            {resume.summary}
          </p>
        </div>
      )}

      {resume.experience?.length > 0 && (
        <div>
          <ResumeSectionTitle template={template}>
            Experience
          </ResumeSectionTitle>
          <div className="flex flex-col gap-4">
            {resume.experience.map((exp, i) => (
              <div key={i}>
                <div className="flex items-baseline justify-between gap-3">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "#111" }}
                  >
                    {[exp.role, exp.company].filter(Boolean).join(" — ")}
                  </p>
                  {exp.period && (
                    <span
                      className="text-xs flex-shrink-0"
                      style={{ color: "#555" }}
                    >
                      {exp.period}
                    </span>
                  )}
                </div>
                {exp.location && (
                  <p
                    className="text-xs italic mt-0.5"
                    style={{ color: "#555" }}
                  >
                    {exp.location}
                  </p>
                )}
                {exp.bullets?.length > 0 && (
                  <ul className="mt-1.5 flex flex-col gap-1">
                    {exp.bullets.map((b, j) => (
                      <li
                        key={j}
                        className="text-[13px] leading-relaxed flex gap-2"
                        style={{ color: "#333" }}
                      >
                        <span style={{ color: accent }}>•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {resume.education?.length > 0 && (
        <div>
          <ResumeSectionTitle template={template}>Education</ResumeSectionTitle>
          <div className="flex flex-col gap-3">
            {resume.education.map((ed, i) => (
              <div key={i}>
                <div className="flex items-baseline justify-between gap-3">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "#111" }}
                  >
                    {[ed.degree, ed.institution].filter(Boolean).join(" — ")}
                  </p>
                  {ed.period && (
                    <span
                      className="text-xs flex-shrink-0"
                      style={{ color: "#555" }}
                    >
                      {ed.period}
                    </span>
                  )}
                </div>
                {ed.details && (
                  <p className="text-xs mt-0.5" style={{ color: "#555" }}>
                    {ed.details}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );

  const renderSidebar = () => (
    <>
      {resume.skills?.length > 0 && (
        <div>
          <ResumeSectionTitle template={template}>Skills</ResumeSectionTitle>
          <div className="flex flex-wrap gap-1.5">
            {resume.skills.map((s, i) => (
              <span
                key={i}
                className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                style={{
                  background: `color-mix(in srgb, ${accent} 15%, transparent)`,
                  color: accent,
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {resume.certifications?.length > 0 && (
        <div>
          <ResumeSectionTitle template={template}>
            Certifications
          </ResumeSectionTitle>
          <ul className="flex flex-col gap-1">
            {resume.certifications.map((c, i) => (
              <li
                key={i}
                className="text-[13px] flex gap-2"
                style={{ color: "#333" }}
              >
                <span style={{ color: accent }}>•</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {resume.languages?.length > 0 && (
        <div>
          <ResumeSectionTitle template={template}>Languages</ResumeSectionTitle>
          <p className="text-[13px]" style={{ color: "#333" }}>
            {resume.languages.join("  ·  ")}
          </p>
        </div>
      )}
    </>
  );

  const getLuminanceText = (hexcolor: string) => {
    if (!hexcolor) return "white";
    let hex = hexcolor.replace("#", "");
    if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? "#111111" : "white";
  };

  const sidebarTextMain = getLuminanceText(accent);
  const sidebarTextSecondary =
    sidebarTextMain === "white"
      ? "rgba(255,255,255,0.7)"
      : "rgba(0,0,0,0.6)";
  const sidebarBorder =
    sidebarTextMain === "white"
      ? "rgba(255,255,255,0.2)"
      : "rgba(0,0,0,0.15)";

  if (template === "classic") {
    return (
      <div className="flex min-h-[1123px] w-full bg-white text-[#333] m-0 p-0 relative text-[13px]" style={{ fontFamily: "system-ui, sans-serif" }}>
        {/* Left Sidebar */}
        <div className="w-[35%] p-8 flex flex-col gap-6 border-none" style={{ backgroundColor: accent, color: sidebarTextMain }}>
          {resume.photoUrl && (
            <img
              src={resume.photoUrl}
              alt="Profile"
              className={`w-36 h-36 mx-auto object-cover border-[3px] shadow-lg ${shapeClass}`}
              style={{ borderColor: sidebarTextMain === "white" ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.8)" }}
            />
          )}
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-wide mt-2">{resume.name}</h1>
            {resume.title && (
              <p className="text-sm mt-1" style={{ color: sidebarTextSecondary }}>
                {resume.title}
              </p>
            )}
          </div>

          {/* CONTACT */}
          {(resume.contact?.phone || resume.contact?.email || resume.contact?.location || (resume.contact?.links && resume.contact.links.length > 0)) ? (
            <div className="mt-2">
              <h2 className="text-sm font-bold tracking-widest uppercase mb-4 pb-1" style={{ borderBottom: `1px solid ${sidebarBorder}` }}>
                Contact
              </h2>
              {/* Contact rows wrap rather than truncate. `truncate` sets
                  overflow:hidden on an inline span, which html2canvas clips to
                  the em-box - that is what sliced the bottom off the email in
                  the downloaded PDF. break-all keeps long addresses inside the
                  narrow sidebar without any clipping. */}
              <div className="flex flex-col gap-3 text-xs" style={{ color: sidebarTextMain }}>
                {resume.contact?.phone && (
                  <div className="flex items-start gap-3 min-w-0">
                    <Phone size={14} className="shrink-0 mt-[3px]" style={{ color: sidebarTextSecondary }} />
                    <span className="min-w-0 break-words leading-[1.5]">{resume.contact.phone}</span>
                  </div>
                )}
                {resume.contact?.email && (
                  <div className="flex items-start gap-3 min-w-0">
                    <Mail size={14} className="shrink-0 mt-[3px]" style={{ color: sidebarTextSecondary }} />
                    <span className="min-w-0 break-all leading-[1.5]">{resume.contact.email}</span>
                  </div>
                )}
                {resume.contact?.location && (
                  <div className="flex items-start gap-3 min-w-0">
                    <MapPin size={14} className="shrink-0 mt-[3px]" style={{ color: sidebarTextSecondary }} />
                    <span className="min-w-0 break-words leading-[1.5]">{resume.contact.location}</span>
                  </div>
                )}
                {resume.contact?.links?.map((link, i) => (
                  <div key={i} className="flex items-start gap-3 min-w-0">
                    <span className="text-[10px] shrink-0 mt-[3px]" style={{ color: sidebarTextSecondary }}>🔗</span>
                    <span className="min-w-0 break-all leading-[1.5]">{link}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* SKILLS */}
          {resume.skills && resume.skills.length > 0 && (
            <div>
              <h2 className="text-sm font-bold tracking-widest uppercase mb-4 pb-1" style={{ borderBottom: `1px solid ${sidebarBorder}` }}>
                Skills
              </h2>
              <ul className="flex flex-col gap-1.5">
                {resume.skills.map((s, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs" style={{ color: sidebarTextMain }}>
                    <span className="text-[10px]" style={{ color: sidebarTextSecondary }}>○</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* LANGUAGES */}
          {resume.languages && resume.languages.length > 0 && (
            <div>
              <h2 className="text-sm font-bold tracking-widest uppercase mb-4 pb-1" style={{ borderBottom: `1px solid ${sidebarBorder}` }}>
                Languages
              </h2>
              <ul className="flex flex-col gap-1.5">
                {resume.languages.map((lang, i) => (
                  <li key={i} className="flex items-center justify-between text-xs" style={{ color: sidebarTextMain }}>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px]" style={{ color: sidebarTextSecondary }}>○</span>
                      <span>{lang}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CERTIFICATIONS / HOBBIES */}
          {resume.certifications && resume.certifications.length > 0 && (
            <div>
              <h2 className="text-sm font-bold tracking-widest uppercase mb-4 pb-1" style={{ borderBottom: `1px solid ${sidebarBorder}` }}>
                Certifications
              </h2>
              <ul className="flex flex-col gap-1.5">
                {resume.certifications.map((c, i) => (
                  <li key={i} className="flex gap-2 text-xs" style={{ color: sidebarTextMain }}>
                    <span className="text-[10px] mt-0.5" style={{ color: sidebarTextSecondary }}>○</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Content Area */}
        <div className="w-[65%] p-10 flex flex-col gap-8 bg-white text-[#111] overflow-hidden">
          {/* PROFILE */}
          {resume.summary && (
            <div>
              <h2 className="text-lg font-bold tracking-widest uppercase mb-3 text-black">
                Profile
              </h2>
              <p className="text-[13px] leading-relaxed text-[#333] text-justify">
                {resume.summary}
              </p>
            </div>
          )}

          {/* WORK EXPERIENCE */}
          {resume.experience && resume.experience.length > 0 && (
            <div>
              <h2 className="text-lg font-bold tracking-widest uppercase mb-4 text-black">
                Work Experience
              </h2>
              <div className="flex flex-col gap-5">
                {resume.experience.map((exp, i) => (
                  <div key={i}>
                    <h3 className="font-bold text-[15px] text-black mb-1">
                      {exp.role}
                    </h3>
                    <div className="flex justify-between items-center text-xs text-[#555] mb-2 font-medium">
                      <span>{[exp.company, exp.location].filter(Boolean).join(" — ")}</span>
                      <span>{exp.period}</span>
                    </div>
                    {exp.bullets && exp.bullets.length > 0 && (
                      <ul className="flex flex-col gap-1.5 mt-2">
                        {exp.bullets.map((b, j) => (
                          <li key={j} className="text-[13px] leading-relaxed text-[#333] flex gap-2">
                            <span className="text-black text-[14px] leading-none mt-0.5">•</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EDUCATION */}
          {resume.education && resume.education.length > 0 && (
            <div>
              <h2 className="text-lg font-bold tracking-widest uppercase mb-4 text-black">
                Education
              </h2>
              <div className="flex flex-col gap-5">
                {resume.education.map((ed, i) => (
                  <div key={i}>
                    <h3 className="font-bold text-[15px] text-black mb-1">
                      {ed.degree}
                    </h3>
                    <div className="flex justify-between items-center text-xs text-[#555] mb-1 font-medium">
                      <span>{ed.institution}</span>
                      <span>{ed.period}</span>
                    </div>
                    {ed.details && (
                      <p className="text-[13px] text-[#333] italic">
                        {ed.details}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (template === "modern") {
    return (
      <div className="flex flex-col min-h-[1123px] w-full bg-[#e6e6e6] text-[#333] m-0 p-0 relative text-[13px]" style={{ fontFamily: "system-ui, sans-serif" }}>
        {/* Top Header */}
        {/* pl-[35%] puts the header text over the right-hand column; the inner
            padding must match that column's px-10 exactly or the name sits off
            the body text by a few pixels. */}
        <div className="w-full h-40 flex items-center pl-[35%]" style={{ backgroundColor: accent }}>
          <div className="px-10 text-white w-full">
            <h1 className="text-4xl font-bold tracking-widest uppercase">{resume.name}</h1>
            {resume.title && (
              <p className="text-base tracking-widest uppercase mt-2 opacity-90">{resume.title}</p>
            )}
          </div>
        </div>

        {/* 2-Column Content */}
        <div className="flex flex-1 w-full">
          {/* Left Sidebar */}
          {/* 40px outer page margin on the left, matching the right column's
              40px outer margin on the other side of the sheet. */}
          <div className="w-[35%] flex flex-col gap-6 relative pl-10 pr-8 pt-6 pb-10 border-r border-[#d4d4d4]">
            {/* The profile photo overlaps the header and sidebar */}
            {resume.photoUrl && (
              <div className="absolute -top-32 left-0 w-full flex justify-center">
                <img
                  src={resume.photoUrl}
                  alt="Profile"
                  className={`w-44 h-44 object-cover border-[6px] border-[#e6e6e6] shadow-sm ${shapeClass}`}
                />
              </div>
            )}
            
            {/* Spacer to push content below the absolute photo */}
            <div className={resume.photoUrl ? "h-16" : ""} />

            {/* CONTACT */}
            {(resume.contact?.phone || resume.contact?.email || resume.contact?.location || (resume.contact?.links && resume.contact.links.length > 0)) ? (
              <div>
                <h2 className="text-[15px] font-bold tracking-[0.15em] uppercase mb-4 pb-2 border-b-2 border-black text-black">
                  Contact
                </h2>
                {/* Wrap instead of truncate - see the note in the classic
                    template: overflow:hidden on an inline span is what clipped
                    the email in the exported PDF. */}
                <div className="flex flex-col gap-3.5 text-[13px] text-black font-medium">
                  {resume.contact?.phone && (
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center text-white shrink-0"><Phone size={12} /></div>
                      <span className="min-w-0 break-words leading-[1.5] pt-[3px]">{resume.contact.phone}</span>
                    </div>
                  )}
                  {resume.contact?.email && (
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center text-white shrink-0"><Mail size={12} /></div>
                      <span className="min-w-0 break-all leading-[1.5] pt-[3px]">{resume.contact.email}</span>
                    </div>
                  )}
                  {resume.contact?.location && (
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center text-white shrink-0"><MapPin size={12} /></div>
                      <span className="min-w-0 break-words leading-[1.5] pt-[3px]">{resume.contact.location}</span>
                    </div>
                  )}
                  {resume.contact?.links?.map((link, i) => (
                    <div key={i} className="flex items-start gap-3 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center text-white shrink-0"><span className="text-[10px]">🔗</span></div>
                      <span className="min-w-0 break-all leading-[1.5] pt-[3px]">{link}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* SKILLS */}
            {resume.skills && resume.skills.length > 0 && (
              <div>
                <h2 className="text-[15px] font-bold tracking-[0.15em] uppercase mb-4 pb-2 border-b-2 border-black text-black">
                  Skills
                </h2>
                <ul className="flex flex-col gap-2">
                  {resume.skills.map((s, i) => (
                    <li key={i} className="flex items-center gap-3 text-[13px] text-[#333] font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* LANGUAGES */}
            {resume.languages && resume.languages.length > 0 && (
              <div>
                <h2 className="text-[15px] font-bold tracking-[0.15em] uppercase mb-4 pb-2 border-b-2 border-black text-black">
                  Languages
                </h2>
                <ul className="flex flex-col gap-2">
                  {resume.languages.map((lang, i) => (
                    <li key={i} className="flex items-center gap-3 text-[13px] text-[#333] font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                      {lang}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* CERTIFICATIONS */}
            {resume.certifications && resume.certifications.length > 0 && (
              <div>
                <h2 className="text-[15px] font-bold tracking-[0.15em] uppercase mb-4 pb-2 border-b-2 border-black text-black">
                  Certifications
                </h2>
                <ul className="flex flex-col gap-2">
                  {resume.certifications.map((c, i) => (
                    <li key={i} className="flex gap-3 text-[13px] text-[#333] font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0 mt-1.5" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Content Area */}
          <div className="w-[65%] bg-white px-10 py-10 flex flex-col gap-6 relative z-0">
            {/* PROFILE */}
            {resume.summary && (
              <div className="flex gap-6 relative">
                <div className="relative flex flex-col items-center">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-white z-10 shrink-0 shadow-sm" style={{ backgroundColor: accent }}>
                    <User size={20} />
                  </div>
                  <div className="w-px h-full bg-black opacity-30 absolute top-11" />
                </div>
                <div className="flex-1 pb-2">
                  <h2 className="text-xl font-bold tracking-[0.15em] uppercase mb-3 text-black pt-2">
                    Profile
                  </h2>
                  <p className="text-[13px] leading-relaxed text-[#555] text-justify">
                    {resume.summary}
                  </p>
                </div>
              </div>
            )}

            {/* EXPERIENCE */}
            {resume.experience && resume.experience.length > 0 && (
              <div className="flex gap-6 relative">
                <div className="relative flex flex-col items-center">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-white z-10 shrink-0 shadow-sm" style={{ backgroundColor: accent }}>
                    <Briefcase size={20} />
                  </div>
                  <div className="w-px h-full bg-black opacity-30 absolute top-11" />
                </div>
                <div className="flex-1 pb-4">
                  <h2 className="text-xl font-bold tracking-[0.15em] uppercase mb-5 text-black pt-2">
                    Work Experience
                  </h2>
                  <div className="flex flex-col gap-6 relative">
                    {resume.experience.map((exp, i) => (
                      <div key={i} className="relative">
                        {/* Small timeline dot */}
                        <div className="absolute top-1.5 -left-[45px] w-3 h-3 rounded-full border-2 border-[#555] bg-white z-10" />
                        
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="font-bold text-base text-black">
                            {exp.company}
                          </h3>
                          <span className="text-[13px] text-black font-medium">{exp.period}</span>
                        </div>
                        <div className="text-[14px] text-[#555] mb-3">
                          {exp.role}
                        </div>
                        {exp.bullets && exp.bullets.length > 0 && (
                          <ul className="flex flex-col gap-2">
                            {exp.bullets.map((b, j) => (
                              <li key={j} className="text-[13px] leading-relaxed text-[#555] flex gap-2">
                                <span className="text-black text-[10px] mt-1.5">•</span>
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* EDUCATION */}
            {resume.education && resume.education.length > 0 && (
              <div className="flex gap-6 relative">
                <div className="relative flex flex-col items-center">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-white z-10 shrink-0 shadow-sm" style={{ backgroundColor: accent }}>
                    <GraduationCap size={20} />
                  </div>
                  <div className="w-px h-full bg-black opacity-30 absolute top-11" />
                </div>
                <div className="flex-1 pb-4">
                  <h2 className="text-xl font-bold tracking-[0.15em] uppercase mb-5 text-black pt-2">
                    Education
                  </h2>
                  <div className="flex flex-col gap-6 relative">
                    {resume.education.map((ed, i) => (
                      <div key={i} className="relative">
                        {/* Small timeline dot */}
                        <div className="absolute top-1.5 -left-[45px] w-3 h-3 rounded-full border-2 border-[#555] bg-white z-10" />
                        
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="font-bold text-base text-black">
                            {ed.degree}
                          </h3>
                          <span className="text-[13px] text-black font-medium">{ed.period}</span>
                        </div>
                        <div className="text-[14px] text-[#555] mb-1">
                          {ed.institution}
                        </div>
                        {ed.details && (
                          <p className="text-[13px] text-[#555] italic mt-2">
                            {ed.details}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white p-12 relative w-full min-h-[1123px] flex flex-col gap-6 text-[13px]"
      style={{ color: "#333" }}
    >
      {renderHeader()}
      {renderContent()}
      {renderSidebar()}
    </div>
  );
}



export default function ResumeBuilderPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <ResumeBuilder onBack={() => window.history.back()} />
    </div>
  );
}
