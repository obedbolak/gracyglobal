import Link from "next/link";
import { Search, ChevronRight, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const jobs = [
  {
    id: "1",
    company: "Amazon",
    logo: "A",
    color: "#FF9900",
    salary: "CFA 16,000 – 250,000/mo",
    applicants: 700,
    type: "Remote",
  },
  {
    id: "2",
    company: "Upwork",
    logo: "U",
    color: "#14a800",
    salary: "CFA 400,000 – 600,000/mo",
    applicants: 950,
    type: "Freelance",
  },
  {
    id: "3",
    company: "Fiverr",
    logo: "F",
    color: "#1dbf73",
    salary: "CFA 100,000 – 300,000/mo",
    applicants: 200,
    type: "Contract",
  },
];

const typeVariant: Record<string, "purple" | "blue" | "scarlet"> = {
  Remote: "blue",
  Freelance: "purple",
  Contract: "scarlet",
};

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
          <Button asChild size="sm" variant="scarlet">
            <Link href="/jobs">View All Jobs</Link>
          </Button>
        </div>

        {/* Search bar — using Input component */}
        <div className="flex flex-col sm:flex-row gap-3 mb-7">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--text-muted)" }}
            />
            <Input
              type="text"
              placeholder="Search remote jobs..."
              className="pl-10 h-11 text-sm"
            />
          </div>
          <div className="flex gap-3">
            <select
              className="px-4 h-11 text-sm rounded-[var(--input-radius)] transition-all flex-1 sm:flex-none sm:min-w-[120px]"
              style={{
                background: "var(--input-bg)",
                border: "1px solid var(--input-border)",
                color: "var(--text-secondary)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
            >
              <option>Category</option>
              <option>Tech</option>
              <option>Design</option>
              <option>Marketing</option>
            </select>
            <Button variant="scarlet" size="lg" className="flex-shrink-0">
              Search
            </Button>
          </div>
        </div>

        {/* Column headers - hidden on mobile */}
        <div className="hidden sm:grid grid-cols-4 px-4 mb-2.5">
          {["Company", "Salary Range", "Applicants", ""].map((h) => (
            <div
              key={h}
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              {h}
            </div>
          ))}
        </div>

        {/* Job rows — using Card component */}
        <div className="space-y-3">
          {jobs.map((job) => (
            <Link key={job.id} href={`/jobs/${job.id}`} className="block group">
              <Card className="sm:grid sm:grid-cols-4 sm:items-center px-4 py-4 rounded-2xl hover:-translate-y-0.5 transition-all duration-200 gap-0 space-y-3 sm:space-y-0">
                {/* Company */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md"
                    style={{ background: job.color }}
                  >
                    {job.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span
                      className="font-semibold text-sm block"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {job.company}
                    </span>
                    <div className="sm:hidden flex items-center gap-2 mt-1">
                      <Badge variant={typeVariant[job.type]} className="text-xs">{job.type}</Badge>
                    </div>
                  </div>
                  <ChevronRight
                    size={14}
                    className="transition-transform duration-200 group-hover:translate-x-0.5 sm:hidden"
                    style={{ color: "var(--text-muted)" }}
                  />
                </div>

                {/* Salary - mobile layout */}
                <div className="sm:hidden">
                  <div
                    className="text-sm font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {job.salary}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Users size={13} style={{ color: "var(--scarlet)" }} />
                    <span
                      className="text-sm font-bold"
                      style={{ color: "var(--scarlet)" }}
                    >
                      {job.applicants.toLocaleString()} applicants
                    </span>
                  </div>
                </div>

                {/* Desktop layout - Salary */}
                <div
                  className="hidden sm:block text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {job.salary}
                </div>

                {/* Desktop layout - Applicants */}
                <div className="hidden sm:flex items-center gap-1.5">
                  <Users size={13} style={{ color: "var(--scarlet)" }} />
                  <span
                    className="text-sm font-bold"
                    style={{ color: "var(--scarlet)" }}
                  >
                    {job.applicants.toLocaleString()}
                  </span>
                </div>

                {/* Desktop layout - Apply + type badge */}
                <div className="hidden sm:flex items-center justify-end gap-2">
                  <Badge variant={typeVariant[job.type]}>{job.type}</Badge>
                  <Button size="xs" className="pointer-events-none">
                    Apply
                  </Button>
                </div>

                {/* Mobile Apply button */}
                <div className="sm:hidden">
                  <Button size="sm" className="w-full pointer-events-none">
                    Apply Now
                  </Button>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* View all CTA */}
        <div className="mt-5">
          <Button
            asChild
            variant="outline"
            className="w-full py-3.5 h-auto rounded-2xl"
          >
            <Link href="/jobs">
              View All Jobs
              <ChevronRight size={16} />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
