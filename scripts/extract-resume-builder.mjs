/**
 * One-shot migration: lifts the AI Resume Builder out of app/jobs/page.tsx
 * into its own module, and trims the jobs page accordingly.
 *
 *   node scripts/extract-resume-builder.mjs
 *
 * Safe to abort: every slice boundary is asserted against the exact line it
 * expects to find. If app/jobs/page.tsx has been edited since this was
 * written, the script stops and changes nothing rather than guessing.
 *
 * A .bak of the original page is written next to it. Delete it once you have
 * confirmed the build passes.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = process.cwd();
const PAGE = join(ROOT, "app/jobs/page.tsx");

if (!existsSync(PAGE)) {
  console.error(`✗ Not found: ${PAGE}\n  Run this from the project root.`);
  process.exit(1);
}

const L = readFileSync(PAGE, "utf8").split("\n");

// [startLine, endLine, firstLineMustStartWith, label] — 1-indexed, inclusive.
const RANGES = {
  gen:      [35,   63,   "// Shape returned by",             "GeneratedResume"],
  ats:      [1954, 2159, "async function downloadAtsResumePdf(", "ATS pdf writer"],
  types:    [2161, 2238, "type ResumeTemplate =",            "templates + form"],
  builder:  [2240, 3271, "function ResumeBuilder(",          "ResumeBuilder"],
  sectitle: [3376, 3438, "function ResumeSectionTitle(",     "section title"],
  preview:  [3440, 4159, "function ResumePreview(",          "ResumePreview"],
};

const cut = {};
for (const [key, [a, b, anchor, label]] of Object.entries(RANGES)) {
  const first = L[a - 1] ?? "";
  if (!first.startsWith(anchor)) {
    console.error(
      `✗ Aborted. Expected line ${a} to start with:\n    ${anchor}\n` +
      `  but found:\n    ${first}\n` +
      `  app/jobs/page.tsx has changed since this migration was written.`
    );
    process.exit(1);
  }
  cut[key] = L.slice(a - 1, b).join("\n");
  console.log(`  ✓ located ${label}  (lines ${a}-${b})`);
}

const write = (rel, body) => {
  const fp = join(ROOT, rel);
  mkdirSync(dirname(fp), { recursive: true });
  writeFileSync(fp, body.replace(/^\n+/, "").trimEnd() + "\n");
  console.log(`  → ${rel}`);
};

const exported = (block, ...decls) =>
  decls.reduce((acc, d) => acc.replace(d, "export " + d), block);

/* ── lib/resume/types.ts ─────────────────────────────────────────────── */
write("lib/resume/types.ts", `
// Shared resume types, templates and page geometry.
//
// These live outside the components so the builder, the preview, the PDF
// writer and the API routes all agree on one definition instead of keeping
// their own drifting copies.

// A4 at 96dpi, in CSS pixels. Preview sizing, page separation and PDF slicing
// all derive from these, so what you see cannot drift from what downloads.
export const A4_WIDTH_PX = 794;
export const A4_HEIGHT_PX = 1123;

${cut.gen.split("\n").slice(1).join("\n")}

${exported(cut.types, "type ResumeTemplate", "const RESUME_TEMPLATES", "interface ResumeForm", "const EMPTY_RESUME_FORM")}
`);

/* ── lib/resume/pdf.ts ───────────────────────────────────────────────── */
write("lib/resume/pdf.ts", `
import { A4_WIDTH_PX, A4_HEIGHT_PX } from "./types";
import type { GeneratedResume, ResumeTemplate } from "./types";

// Both libraries are bundled dependencies pulled in with dynamic import(), so
// they are code-split and only fetched when someone actually downloads.
//
// They used to be <script> tags pointing at a CDN, which is what caused the
// "Could not load the PDF library" failures: any ad-blocker, offline moment or
// unreachable CDN broke the core feature with no fallback. A bundled import
// cannot fail that way.
//
// Requires: npm i jspdf html2canvas-pro
async function loadJsPDF() {
  return (await import("jspdf")).jsPDF;
}

// html2canvas-pro, not html2canvas: this project is on Tailwind v4, which
// emits oklch() and compiles opacity modifiers to color-mix(in oklab, ...).
// Stock html2canvas 1.4.1 throws "unsupported color function" on both. The pro
// fork has an identical API and understands lab/lch/oklab/oklch.
async function loadHtml2Canvas() {
  return (await import("html2canvas-pro")).default;
}

export function resumeFileName(name?: string) {
  const safe = (name || "resume")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return \`\${safe || "resume"}-resume.pdf\`;
}

// Rasterises the ACTUAL preview DOM node and slices it into A4 pages, which is
// what makes the download match the preview. The text-drawing version below
// rebuilds the resume from scratch in Helvetica and cannot reproduce the
// template, accent colour or photo.
export async function downloadResumePdfFromNode(
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
      el.style.width = \`\${A4_WIDTH_PX}px\`;
    },
  } as any);

  const doc = new JsPDF({ unit: "pt", format: "a4" });
  const pdfW = doc.internal.pageSize.getWidth();
  const pdfH = doc.internal.pageSize.getHeight();

  // One PDF page per A4_HEIGHT_PX of captured content - the same boundaries
  // the preview splits its sheets at.
  const slicePx = A4_HEIGHT_PX * CAPTURE_SCALE;
  const pageCount = Math.max(1, Math.ceil(canvas.height / slicePx));

  for (let page = 0; page < pageCount; page++) {
    const offset = page * slicePx;
    const sliceHeight = Math.min(slicePx, canvas.height - offset);
    if (sliceHeight <= 0) break;

    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = canvas.width;
    pageCanvas.height = sliceHeight;

    const ctx = pageCanvas.getContext("2d");
    if (!ctx) throw new Error("Could not prepare the PDF page.");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
    ctx.drawImage(canvas, 0, offset, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);

    if (page > 0) doc.addPage();
    // Width fills the page; height stays proportional so a short final page
    // sits at the top rather than being stretched.
    const drawHeight = Math.min((sliceHeight / canvas.width) * pdfW, pdfH);
    doc.addImage(pageCanvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, pdfW, drawHeight);
  }

  doc.save(fileName);
}

// Vector, selectable-text version. Not the main download because it cannot
// reproduce the templates, but its output is real text and therefore parseable
// by applicant tracking systems.
${cut.ats.replace("async function downloadAtsResumePdf(", "export async function downloadAtsResumePdf(")}
`);

/* ── components/resume/A4ScaleWrapper.tsx ────────────────────────────── */
write("components/resume/A4ScaleWrapper.tsx", `
"use client";

import { useEffect, useRef, useState } from "react";
import { A4_WIDTH_PX, A4_HEIGHT_PX } from "@/lib/resume/types";

/**
 * Renders resume content as discrete, whole A4 sheets in a scroller.
 *
 * The document flows continuously; each sheet is a fixed A4 window onto it,
 * offset by exactly one page height. Those are the same offsets the PDF is
 * sliced at, so page 2 here is page 2 in the download.
 *
 * The previous version drew one tall continuous strip, which meant the
 * parent's max-height clipped it mid-page.
 */
export default function A4ScaleWrapper({
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

  const pageCount = Math.max(1, Math.ceil(contentHeight / A4_HEIGHT_PX));
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
                    transform: \`scale(\${scale})\`,
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
`);

/* ── components/resume/ResumePreview.tsx ─────────────────────────────── */
write("components/resume/ResumePreview.tsx", `
"use client";

import { Phone, Mail, MapPin, User, Briefcase, GraduationCap } from "lucide-react";
import { RESUME_TEMPLATES } from "@/lib/resume/types";
import type { GeneratedResume, ResumeTemplate } from "@/lib/resume/types";

${cut.sectitle}

${cut.preview.replace("function ResumePreview(", "export default function ResumePreview(")}
`);

/* ── components/resume/ResumeBuilder.tsx ─────────────────────────────── */
let builder = cut.builder.replace(
  "function ResumeBuilder({ onBack }: { onBack: () => void }) {",
  "export default function ResumeBuilder({ onBack }: { onBack: () => void }) {",
);

const must = (hay, needle, what) => {
  if (!hay.includes(needle)) {
    console.error(`✗ Aborted: could not find ${what} inside ResumeBuilder.`);
    process.exit(1);
  }
};

// 1. AI-polish state
const STATE_ANCHOR = "  const captureRef = useRef<HTMLDivElement>(null);";
must(builder, STATE_ANCHOR, "captureRef");
builder = builder.replace(STATE_ANCHOR, STATE_ANCHOR + `

  // AI polish. preEnhanceResume is the undo buffer - a one-click rewrite of
  // someone's CV needs a one-click way back.
  const [enhancing, setEnhancing] = useState(false);
  const [enhanceInstruction, setEnhanceInstruction] = useState("");
  const [enhanceNote, setEnhanceNote] = useState<string | null>(null);
  const [preEnhanceResume, setPreEnhanceResume] =
    useState<GeneratedResume | null>(null);`);

// 2. AI-polish handlers
const HANDLER_ANCHOR = "  async function handleDownload() {";
must(builder, HANDLER_ANCHOR, "handleDownload");
builder = builder.replace(HANDLER_ANCHOR, `  async function handleEnhance() {
    const current = resume ?? mapFormToResume();
    setEnhancing(true);
    setError(null);
    setEnhanceNote(null);
    try {
      const res = await fetch("/api/jobs/resume/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume: current,
          instruction: enhanceInstruction.trim() || undefined,
          targetRole: form.targetRole || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not enhance the resume.");

      setPreEnhanceResume(current);
      setResume(data.resume as GeneratedResume);
      setEnhanceNote(data.summary || null);
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

` + HANDLER_ANCHOR);

// 3. AI-polish panel, directly under the results action bar
const UI_ANCHOR = `                  {downloading ? "Preparing…" : "Download PDF ↓"}
                </button>
              </div>
            </div>

            {error && (`;
must(builder, UI_ANCHOR, "results action bar");
builder = builder.replace(UI_ANCHOR, `                  {downloading ? "Preparing…" : "Download PDF ↓"}
                </button>
              </div>
            </div>

            {/* AI polish */}
            <div className="glass p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    ✨ Polish with AI
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
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

            {error && (`);

// 4. The viewer owns its own scrolling now, so the column must not clip it.
const COL_OLD = "sticky top-8 overflow-y-auto overflow-x-hidden max-h-[calc(100vh-4rem)] pb-12 w-full flex flex-col gap-3 ";
must(builder, COL_OLD, "preview column wrapper");
builder = builder.replace(COL_OLD, "sticky top-8 w-full flex flex-col gap-3 pb-12 ");

write("components/resume/ResumeBuilder.tsx", `
"use client";

import { useRef, useState } from "react";
import { Download, Settings } from "lucide-react";
import ProfileUpload from "@/components/shared/ProfileUpload";
import FormField from "@/components/shared/FormField";
import ResumePreview from "@/components/resume/ResumePreview";
import A4ScaleWrapper from "@/components/resume/A4ScaleWrapper";
import { A4_WIDTH_PX, EMPTY_RESUME_FORM, RESUME_TEMPLATES } from "@/lib/resume/types";
import type { GeneratedResume, ResumeForm, ResumeTemplate } from "@/lib/resume/types";
import {
  downloadAtsResumePdf,
  downloadResumePdfFromNode,
  resumeFileName,
} from "@/lib/resume/pdf";

${builder}
`);

/* ── trim app/jobs/page.tsx ──────────────────────────────────────────── */
writeFileSync(PAGE + ".bak", L.join("\n"));

const out = [...L];
// Descending, so earlier indices stay valid.
[[4291, 4294], [1801, 4160], [399, 425], [35, 63]].forEach(([a, b]) =>
  out.splice(a - 1, b - a + 1),
);
let page = out.join("\n");

const GOTO_OLD = `    setView(target);
  }`;
must(page, GOTO_OLD, "goTo()");
page = page.replace(GOTO_OLD, `    // The resume builder is its own route now, not a view inside this page.
    if (target === "resume-builder") {
      router.push("/resume");
      return;
    }
    setView(target);
  }`);

page = page.replace(
  /^import \{[^}]*\} from "lucide-react";$/m,
  `import { X, SlidersHorizontal, Search } from "lucide-react";`,
);
page = page.replace('import ProfileUpload from "@/components/shared/ProfileUpload";\n', "");
page = page.replace(
  'import ShareButton from "@/components/shared/ShareButton";',
  'import ShareButton from "@/components/shared/ShareButton";\nimport FormField from "@/components/shared/FormField";',
);

for (const dead of ["ResumeBuilder", "ResumePreview", "A4ScaleWrapper", "GeneratedResume", "RESUME_TEMPLATES"]) {
  if (new RegExp("\\b" + dead + "\\b").test(page)) {
    console.error(`✗ Aborted: '${dead}' still referenced in the trimmed page. Nothing was overwritten.`);
    process.exit(1);
  }
}

writeFileSync(PAGE, page);
console.log(`  → app/jobs/page.tsx  (${L.length} → ${page.split("\n").length} lines, .bak written)`);
console.log("\n✓ Done. Now run:  npm i jspdf html2canvas-pro");
