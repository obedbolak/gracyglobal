"use client";

// Shared between the job forms and the resume builder. Lifted out of
// app/jobs/page.tsx so the builder could move to its own route without
// duplicating it.
export default function FormField({
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
