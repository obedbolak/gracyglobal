import { redirect } from "next/navigation";

// The builder lives at /jobs/resume-builder. This alias exists so /resume and
// any links already pointing at it keep working.
export default function ResumeRedirectPage() {
  redirect("/jobs/resume-builder");
}
