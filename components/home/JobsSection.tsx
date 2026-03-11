// components/home/JobsSection.tsx
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
    <section
      className="py-16"
      style={{ background: "var(--gray-50, #F9FAFB)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-1">
              Find Remote Jobs
            </h2>
            <p className="text-sm text-gray-500">
              Search for remote work opportunities across Africa.
            </p>
          </div>
          <Link
            href="/jobs"
            className="text-sm font-bold px-5 py-2 rounded-xl text-white transition-all hover:scale-105 whitespace-nowrap"
            style={{
              background: "linear-gradient(135deg, #DC143C, #7B2FBE)",
              boxShadow: "0 4px 14px rgba(220,20,60,0.3)",
            }}
          >
            View All Jobs
          </Link>
        </div>

        {/* Search bar */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search remote jobs..."
              className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
            />
          </div>
          <select className="px-4 py-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none text-gray-600">
            <option>Category</option>
            <option>Tech</option>
            <option>Design</option>
            <option>Marketing</option>
          </select>
          <button
            className="px-5 py-3 text-sm font-bold text-white rounded-xl whitespace-nowrap transition-all hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #DC143C, #7B2FBE)",
              boxShadow: "0 4px 12px rgba(220,20,60,0.3)",
            }}
          >
            Search
          </button>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-4 px-4 mb-2">
          {["Company", "Experience Level", "Remote Type", ""].map((h) => (
            <div
              key={h}
              className="text-xs font-semibold text-gray-400 uppercase tracking-wider"
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
              className="grid grid-cols-4 items-center bg-white rounded-2xl px-4 py-4 border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all duration-200 group"
            >
              {/* Company */}
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ background: job.color }}
                >
                  {job.logo}
                </div>
                <span className="font-semibold text-gray-900 text-sm">
                  {job.company}
                </span>
                <ChevronRight
                  size={14}
                  className="text-gray-300 group-hover:text-purple-400 transition-colors"
                />
              </div>

              {/* Salary */}
              <div className="text-sm text-gray-600 font-medium">
                {job.salary}
              </div>

              {/* Applicants */}
              <div className="flex items-center gap-1.5">
                <Users size={13} style={{ color: "#DC143C" }} />
                <span
                  className="text-sm font-bold"
                  style={{ color: "#DC143C" }}
                >
                  {job.applicants.toLocaleString()}
                </span>
              </div>

              {/* Apply button */}
              <div className="flex justify-end">
                <span
                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-all group-hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, #1A3ADB, #7B2FBE)",
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
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm font-bold border-2 transition-all hover:scale-[1.01]"
            style={{ borderColor: "#7B2FBE", color: "#7B2FBE" }}
          >
            View All Jobs
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
