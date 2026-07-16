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

      {/* Two-column row-aligned layout for home sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="mb-6">
            <CounselorsSection />
          </div>
          <div className="mb-6">
            <JobsSection />
          </div>
          <div className="mb-6">
            <CommunitySection />
          </div>
          <div className="mb-6">
            <MarketplaceSection />
          </div>
          <div className="mb-6">
            <LearnSection />
          </div>
          <div className="mb-6">
            <ServicesSection />
          </div>
        </div>
      </div>
    </main>
  );
}
