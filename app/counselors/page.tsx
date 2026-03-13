import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CounselorsHero from "@/components/counselors/CounselorsHero";
import CounselorsServices from "@/components/counselors/CounselorsServices";
import CounselorsList from "@/components/counselors/CounselorsList";
import CounselorsHowItWorks from "@/components/counselors/Counselorshowitworks";
import CounselorsCTA from "@/components/counselors/CounselorsCTA";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find a Counselor",
  description:
    "Because 'We Need to Talk' shouldn't be scary. Connect with certified counselors for marriage, trauma healing, and life coaching — private, affordable, available now.",
};

export default function CounselorsPage() {
  return (
    <main className="min-h-screen">
      <CounselorsHero />
      <CounselorsServices />
      <CounselorsHowItWorks />
      <CounselorsList />
      <CounselorsCTA />
      <Footer />
    </main>
  );
}
