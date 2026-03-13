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
        <div className="flex gap-3 mb-7">
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
          <select
            className="px-4 h-11 text-sm rounded-[var(--input-radius)] transition-all"
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
          <Button variant="scarlet" size="lg">
            Search
          </Button>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-4 px-4 mb-2.5">
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
              <Card className="grid grid-cols-4 items-center px-4 py-4 rounded-2xl hover:-translate-y-0.5 transition-all duration-200 gap-0">
                {/* Company */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md"
                    style={{ background: job.color }}
                  >
                    {job.logo}
                  </div>
                  <span
                    className="font-semibold text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {job.company}
                  </span>
                  <ChevronRight
                    size={14}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                    style={{ color: "var(--text-muted)" }}
                  />
                </div>

                {/* Salary */}
                <div
                  className="text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {job.salary}
                </div>

                {/* Applicants */}
                <div className="flex items-center gap-1.5">
                  <Users size={13} style={{ color: "var(--scarlet)" }} />
                  <span
                    className="text-sm font-bold"
                    style={{ color: "var(--scarlet)" }}
                  >
                    {job.applicants.toLocaleString()}
                  </span>
                </div>

                {/* Apply + type badge */}
                <div className="flex items-center justify-end gap-2">
                  <Badge variant={typeVariant[job.type]}>{job.type}</Badge>
                  <Button size="xs" className="pointer-events-none">
                    Apply
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
