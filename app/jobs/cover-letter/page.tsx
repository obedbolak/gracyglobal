"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Shape returned by /api/jobs/cover-letter (kept in sync with the route).
interface GeneratedCoverLetter {
  salutation: string;
  paragraphs: string[];
  signOff: string;
}

// Handoff from the resume builder. Written to sessionStorage there, read once
// here, then cleared - it is a one-shot prefill, not a store.
const HANDOFF_KEY = "gg:coverLetterSeed";

interface CoverLetterForm {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  company: string;
  hiringManager: string;
  roleTitle: string;
  jobDescription: string;
  highlights: string;
  tone: "professional" | "warm" | "direct";
  length: "short" | "standard";
}

const EMPTY_FORM: CoverLetterForm = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  company: "",
  hiringManager: "",
  roleTitle: "",
  jobDescription: "",
  highlights: "",
  tone: "professional",
  length: "standard",
};

const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

async function loadJsPDF() {
  return (await import("jspdf")).jsPDF;
}

function fileNameFor(name: string, company: string) {
  const safe = (s: string) =>
    s
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase();
  const parts = [safe(name) || "cover", safe(company)].filter(Boolean);
  return `${parts.join("-")}-cover-letter.pdf`;
}

// Vector text PDF rather than a rasterised screenshot: a cover letter is pure
// prose, so real selectable text is both smaller and readable by the applicant
// tracking systems that will parse it.
async function downloadCoverLetterPdf(
  letter: GeneratedCoverLetter,
  form: CoverLetterForm,
) {
  const JsPDF = await loadJsPDF();
  const doc = new JsPDF({ unit: "pt", format: "a4" });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 64;
  const usable = pageW - margin * 2;
  let y = margin;

  const ensureRoom = (needed: number) => {
    if (y + needed > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const write = (
    text: string,
    { size = 11, style = "normal" as "normal" | "bold", gap = 14 } = {},
  ) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, usable) as string[];
    ensureRoom(lines.length * (size + 3));
    doc.text(lines, margin, y);
    y += lines.length * (size + 3) + gap;
  };

  // Sender block
  if (form.fullName.trim()) write(form.fullName.trim(), { size: 16, style: "bold", gap: 4 });
  const contactLine = [form.email, form.phone, form.location]
    .map((s) => s.trim())
    .filter(Boolean)
    .join("  ·  ");
  if (contactLine) write(contactLine, { size: 10, gap: 22 });

  // Date
  write(
    new Date().toLocaleDateString(undefined, {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    { size: 10, gap: 18 },
  );

  // Recipient
  const recipient = [form.hiringManager, form.company]
    .map((s) => s.trim())
    .filter(Boolean);
  if (recipient.length) write(recipient.join("\n"), { size: 11, gap: 20 });

  write(letter.salutation, { size: 11, gap: 14 });
  letter.paragraphs.forEach((p) => write(p, { size: 11, gap: 14 }));
  write(letter.signOff, { size: 11, gap: 26 });
  if (form.fullName.trim()) write(form.fullName.trim(), { size: 11, style: "bold", gap: 0 });

  doc.save(fileNameFor(form.fullName, form.company));
}

function Field({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span
        className="text-xs font-semibold uppercase tracking-wider"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
        {optional && (
          <span className="font-normal normal-case tracking-normal opacity-70">
            {" "}
            · optional
          </span>
        )}
      </span>
      {children}
    </label>
  );
}

export default function CoverLetterPage() {
  const [form, setForm] = useState<CoverLetterForm>(EMPTY_FORM);
  const [letter, setLetter] = useState<GeneratedCoverLetter | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const [prefilled, setPrefilled] = useState(false);

  const update = (field: keyof CoverLetterForm, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // Pick up anything the resume builder left for us.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(HANDOFF_KEY);
      if (!raw) return;
      sessionStorage.removeItem(HANDOFF_KEY);
      const seed = JSON.parse(raw) as Partial<CoverLetterForm>;
      setForm((prev) => ({ ...prev, ...seed }));
      setPrefilled(true);
    } catch {
      // A malformed handoff should never break the page.
    }
  }, []);

  const canGenerate = !!form.fullName.trim() && !!form.roleTitle.trim();

  async function handleGenerate() {
    if (!canGenerate) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/jobs/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not write the letter.");
      setLetter(data.letter as GeneratedCoverLetter);
      setMobileTab("preview");
    } catch (e: any) {
      setError(e?.message || "Could not write the letter. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function letterAsText() {
    if (!letter) return "";
    return [
      letter.salutation,
      "",
      ...letter.paragraphs.flatMap((p) => [p, ""]),
      letter.signOff,
      form.fullName.trim(),
    ].join("\n");
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(letterAsText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy. Select the text in the preview instead.");
    }
  }

  async function handleDownload() {
    if (!letter) return;
    setDownloading(true);
    setError(null);
    try {
      await downloadCoverLetterPdf(letter, form);
    } catch (e: any) {
      setError(e?.message || "Could not generate the PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <div className="mx-auto max-w-7xl px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Header row */}
        <div className="col-span-1 lg:col-span-2 flex items-center justify-between gap-2 flex-wrap">
          <Link
            href="/jobs/resume-builder"
            className="flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ color: "var(--text-muted)" }}
          >
            ← Back to Resume Builder
          </Link>

          <div
            className="lg:hidden flex p-1 rounded-lg border w-full max-w-[200px]"
            style={{
              background: "var(--glass-bg)",
              borderColor: "var(--divider)",
            }}
          >
            <button
              onClick={() => setMobileTab("edit")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                mobileTab === "edit"
                  ? "bg-white text-black shadow-sm"
                  : "text-[var(--text-secondary)] hover:bg-white/5"
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setMobileTab("preview")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                mobileTab === "preview"
                  ? "bg-[var(--purple)] text-white shadow-sm"
                  : "text-[var(--text-secondary)] hover:bg-white/5"
              }`}
            >
              Letter
            </button>
          </div>
        </div>

        {/* ── Left: the form ── */}
        <div
          className={`flex-col gap-5 ${mobileTab === "preview" ? "hidden lg:flex" : "flex"}`}
        >
          <div>
            <h1
              className="text-2xl font-bold flex items-center gap-2"
              style={{ color: "var(--text-primary)" }}
            >
              ✉️ Cover Letter
            </h1>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--text-secondary)" }}
            >
              AI writes the letter from what you give it. It will not invent
              employers, qualifications or numbers you did not supply.
            </p>
          </div>

          {prefilled && (
            <p
              className="text-xs px-3 py-2 rounded-lg"
              style={{
                background: "var(--success-bg)",
                color: "var(--success-text)",
                border: "1px solid var(--success-border)",
              }}
            >
              ✓ Prefilled from your resume. Edit anything below.
            </p>
          )}

          <div className="glass p-5 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Your full name">
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  placeholder="e.g. James Kennedy"
                  className="glass-input w-full px-4 py-2.5 text-sm"
                />
              </Field>
              <Field label="Role you are applying for">
                <input
                  type="text"
                  value={form.roleTitle}
                  onChange={(e) => update("roleTitle", e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className="glass-input w-full px-4 py-2.5 text-sm"
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Email" optional>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="glass-input w-full px-4 py-2.5 text-sm"
                />
              </Field>
              <Field label="Phone" optional>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className="glass-input w-full px-4 py-2.5 text-sm"
                />
              </Field>
            </div>

            <Field label="Your location" optional>
              <input
                type="text"
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                placeholder="e.g. Yaoundé, Cameroon"
                className="glass-input w-full px-4 py-2.5 text-sm"
              />
            </Field>
          </div>

          <div className="glass p-5 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Institution or company" optional>
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) => update("company", e.target.value)}
                  placeholder="e.g. MTN Cameroon"
                  className="glass-input w-full px-4 py-2.5 text-sm"
                />
              </Field>
              <Field label="Hiring manager's name" optional>
                <input
                  type="text"
                  value={form.hiringManager}
                  onChange={(e) => update("hiringManager", e.target.value)}
                  placeholder="Leave blank if you don't know it"
                  className="glass-input w-full px-4 py-2.5 text-sm"
                />
              </Field>
            </div>

            <Field label="Job description or details about the role" optional>
              <textarea
                value={form.jobDescription}
                onChange={(e) => update("jobDescription", e.target.value)}
                rows={5}
                placeholder="Paste the posting here. The more the AI knows about the role, the better it can aim the letter."
                className="glass-input w-full px-4 py-2.5 text-sm resize-y"
              />
            </Field>

            <Field label="What should the letter highlight about you?" optional>
              <textarea
                value={form.highlights}
                onChange={(e) => update("highlights", e.target.value)}
                rows={5}
                placeholder="Your strongest experience for this role — projects, results, responsibilities. Only what is true; nothing will be invented for you."
                className="glass-input w-full px-4 py-2.5 text-sm resize-y"
              />
            </Field>
          </div>

          <div className="glass p-5 flex flex-col gap-4">
            <Field label="Tone">
              <div className="flex gap-2">
                {(["professional", "warm", "direct"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => update("tone", t)}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg border capitalize transition-all ${
                      form.tone === t
                        ? "bg-[var(--purple)] text-white border-transparent shadow-sm"
                        : "border-[var(--divider)] text-[var(--text-secondary)] hover:bg-white/5"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Length">
              <div className="flex gap-2">
                {(["short", "standard"] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => update("length", l)}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg border capitalize transition-all ${
                      form.length === l
                        ? "bg-[var(--purple)] text-white border-transparent shadow-sm"
                        : "border-[var(--divider)] text-[var(--text-secondary)] hover:bg-white/5"
                    }`}
                  >
                    {l === "short" ? "Short (2–3 ¶)" : "Standard (3–4 ¶)"}
                  </button>
                ))}
              </div>
            </Field>
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

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || !canGenerate}
            title={
              canGenerate
                ? undefined
                : "Your name and the role you are applying for are required."
            }
            className="btn-primary px-4 py-3 text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Writing…"
              : letter
                ? "Rewrite letter ✨"
                : "Write my cover letter ✨"}
          </button>
        </div>

        {/* ── Right: the letter ── */}
        <div
          className={`sticky top-8 w-full flex-col gap-3 pb-12 ${
            mobileTab === "edit" ? "hidden lg:flex" : "flex"
          }`}
        >
          {letter ? (
            <>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleCopy}
                  className="btn-secondary px-4 py-2.5 text-sm font-semibold rounded-lg"
                >
                  {copied ? "✓ Copied" : "Copy text"}
                </button>
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="btn-primary px-4 py-2.5 text-sm font-semibold rounded-lg disabled:opacity-70"
                >
                  {downloading ? "Preparing…" : "Download PDF ↓"}
                </button>
              </div>

              <div
                className="w-full overflow-y-auto overscroll-contain rounded-xl"
                style={{
                  maxHeight: "calc(100vh - 12rem)",
                  background: "var(--glass-bg-subtle)",
                  border: "1px solid var(--glass-border)",
                }}
              >
                <div className="flex justify-center py-6 px-3">
                  <div
                    className="bg-white text-[#111] shadow-2xl px-14 py-16 w-full"
                    style={{
                      maxWidth: A4_WIDTH_PX,
                      minHeight: A4_HEIGHT_PX / 1.6,
                      fontFamily: "Georgia, serif",
                    }}
                  >
                    {form.fullName.trim() && (
                      <p className="text-xl font-bold">{form.fullName}</p>
                    )}
                    {[form.email, form.phone, form.location]
                      .map((s) => s.trim())
                      .filter(Boolean).length > 0 && (
                      <p className="text-xs text-[#555] mt-1">
                        {[form.email, form.phone, form.location]
                          .map((s) => s.trim())
                          .filter(Boolean)
                          .join("  ·  ")}
                      </p>
                    )}

                    <p className="text-xs text-[#555] mt-8">
                      {new Date().toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>

                    {(form.hiringManager.trim() || form.company.trim()) && (
                      <p className="text-sm mt-6 leading-relaxed">
                        {form.hiringManager.trim() && (
                          <>
                            {form.hiringManager.trim()}
                            <br />
                          </>
                        )}
                        {form.company.trim()}
                      </p>
                    )}

                    <p className="text-sm mt-8">{letter.salutation}</p>

                    {letter.paragraphs.map((p, i) => (
                      <p
                        key={i}
                        className="text-sm mt-4 leading-[1.7] text-justify"
                      >
                        {p}
                      </p>
                    ))}

                    <p className="text-sm mt-8">{letter.signOff}</p>
                    {form.fullName.trim() && (
                      <p className="text-sm font-semibold mt-6">
                        {form.fullName}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div
              className="rounded-xl p-10 text-center flex flex-col items-center gap-3"
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--divider)",
              }}
            >
              <span className="text-4xl">✉️</span>
              <p
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Your letter will appear here
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Fill in your name and the role, add anything you want
                highlighted, then hit write.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
