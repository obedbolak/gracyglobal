"use client";

import Link from "next/link";
import { Search, ChevronRight, Users } from "lucide-react";

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
          <Link
            href="/jobs"
            className="text-sm font-bold px-5 py-2.5 rounded-xl text-white transition-all hover:scale-105 whitespace-nowrap"
            style={{
              background:
                "linear-gradient(135deg, var(--scarlet), var(--purple))",
              boxShadow: "0 4px 14px rgba(220,20,60,0.30)",
            }}
          >
            View All Jobs
          </Link>
        </div>

        {/* Search bar */}
        <div className="flex gap-3 mb-7">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              type="text"
              placeholder="Search remote jobs..."
              className="w-full pl-10 pr-4 py-3 text-sm rounded-xl transition-all glass-input"
              style={{ color: "var(--text-primary)" }}
            />
          </div>
          <select
            className="px-4 py-3 text-sm rounded-xl glass-input"
            style={{ color: "var(--text-secondary)" }}
          >
            <option>Category</option>
            <option>Tech</option>
            <option>Design</option>
            <option>Marketing</option>
          </select>
          <button
            className="px-5 py-3 text-sm font-bold text-white rounded-xl whitespace-nowrap transition-all hover:scale-105"
            style={{
              background:
                "linear-gradient(135deg, var(--scarlet), var(--purple))",
              boxShadow: "0 4px 12px rgba(220,20,60,0.30)",
            }}
          >
            Search
          </button>
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

        {/* Job rows */}
        <div className="space-y-3">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="grid grid-cols-4 items-center px-4 py-4 rounded-2xl transition-all duration-200 group hover:-translate-y-0.5"
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--card-border)",
                boxShadow: "var(--card-shadow)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
              }}
            >
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
                  className="transition-colors duration-200 group-hover:translate-x-0.5"
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

              {/* Apply button */}
              <div className="flex justify-end">
                <span
                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-all group-hover:scale-105"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--blue), var(--purple))",
                  }}
                >
                  Apply
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* View all CTA */}
        <div className="mt-5">
          <Link
            href="/jobs"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm font-bold transition-all hover:scale-[1.01]"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
              color: "var(--accent-primary)",
              backdropFilter: "blur(12px)",
            }}
          >
            View All Jobs
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
