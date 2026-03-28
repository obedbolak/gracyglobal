// app/counselors/page.tsx
"use client";

import CounselorsHero from "@/components/counselors/CounselorsHero";
import CounselorsServices from "@/components/counselors/CounselorsServices";
import CounselorsList from "@/components/counselors/CounselorsList";
import CounselorsHowItWorks from "@/components/counselors/Counselorshowitworks";
import CounselorsCTA from "@/components/counselors/CounselorsCTA";

export default function CounselorsPage() {
  return (
    <main className="min-h-screen">
      <CounselorsHero />
      <CounselorsServices />
      <CounselorsHowItWorks />
      <CounselorsList />
      <CounselorsCTA />
    </main>
  );
}
