import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function JobsSection() {
  return (
    <section className="py-16 relative">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2
              className="text-2xl font-extrabold mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              Find Remote Jobs
            </h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Search for remote work opportunities across the World.
            </p>
          </div>
        </div>

        {/* Coming Soon Message */}
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <h3 className="text-3xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
              Coming Soon
            </h3>
            <p className="text-lg mb-2" style={{ color: "var(--text-secondary)" }}>
              Remote Jobs Platform
            </p>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
              We're building an amazing platform to connect you with the best remote job opportunities worldwide.
            </p>
            <Button asChild size="sm" variant="scarlet">
              <Link href="/jobs">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
