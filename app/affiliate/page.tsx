import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AffiliateHero from "@/components/affiliate/AffiliateHero";
import AffiliateHowItWorks from "@/components/affiliate/AffiliateHowItWorks";
import AffiliateTiers from "@/components/affiliate/AffiliateTiers";
import AffiliateStats from "@/components/affiliate/AffiliateStats";
import AffiliateTestimonials from "@/components/affiliate/AffiliateTestimonials";
import AffiliateFAQ from "@/components/affiliate/AffiliateFAQ";
import AffiliateJoinCTA from "@/components/affiliate/AffiliateJoinCTA";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Become an Affiliate",
  description:
    "Join the GracyGlobal affiliate program. Earn up to 30% commission on every referral and help build a stronger Africa — one click at a time.",
};

export default function AffiliatePage() {
  return (
    <main className="min-h-screen">
      <AffiliateHero />
      <AffiliateStats />
      <AffiliateHowItWorks />
      <AffiliateTiers />
      <AffiliateTestimonials />
      <AffiliateFAQ />
      <AffiliateJoinCTA />
      <Footer />
    </main>
  );
}
