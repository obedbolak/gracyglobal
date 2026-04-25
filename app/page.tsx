// app/page.tsx
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import StatsBar from "@/components/home/StatsBar";
import CounselorsSection from "@/components/home/CounselorsSection";
import JobsSection from "@/components/home/JobsSection";
import CommunitySection from "@/components/home/CommunitySection";
import MarketplaceSection from "@/components/home/MarketplaceSection";
import ServicesSection from "@/components/home/ServicesSection";
import LearnSection from "@/components/home/LearnSection";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden">
      <HeroSection />
      <StatsBar />

      {/* Two-column layout for Counselors + Jobs (mirrors the reference design) */}
      <div className="max-w-7xl mx-auto">
        {/* On large screens, side by side */}
        <div className="lg:grid lg:grid-cols-2 lg:divide-x lg:divide-gray-50">
          <CounselorsSection />
          <JobsSection />
        </div>

        <div className="lg:grid lg:grid-cols-2 lg:divide-x lg:divide-gray-50">
          <CommunitySection />
          <MarketplaceSection />
        </div>

        {/* Learn + Services side by side on large screens */}
        <div className="lg:grid lg:grid-cols-2 lg:divide-x lg:divide-gray-50">
          <LearnSection />
          <ServicesSection />
        </div>
      </div>
    </main>
  );
}
