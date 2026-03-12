// components/home/CommunitySection.tsx
import Link from "next/link";
import { Heart } from "lucide-react";

const categories = [
  {
    label: "Youth\nEmpowerment",
    gradient: "linear-gradient(135deg, #7B2FBE, #1A3ADB)",
    img: "https://images.unsplash.com/photo-1529390079861-591de354faf5?w=400&q=80",
  },
  {
    label: "Women\nEmpowerment",
    gradient: "linear-gradient(135deg, #DC143C, #7B2FBE)",
    img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
  },
  {
    label: "Community\nDevelopment",
    gradient: "linear-gradient(135deg, #1A3ADB, #DC143C)",
    img: "https://images.unsplash.com/photo-1517486808906-6ca8b3f8e1c1?w=400&q=80",
  },
];

const projects = [
  {
    title: "Youth Entrepreneurship",
    cat: "Youth",
    desc: "Grow skills, build your own profitable business model.",
  },
  {
    title: "Women Empowerment",
    cat: "Women",
    desc: "Find balance, overcome barriers, meet peers.",
  },
  {
    title: "Community Development",
    cat: "Community",
    desc: "Foster modern progress throughout World.",
  },
];

export default function CommunitySection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-1">
              My Nation & I
            </h2>
            <p className="text-sm text-gray-500">
              Building Stronger Communities Together
            </p>
          </div>
        </div>

        {/* Category tabs */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {categories.map((cat, i) => (
            <button
              key={i}
              className="py-3 px-4 rounded-xl text-white text-xs font-bold leading-tight text-center transition-all hover:scale-105"
              style={{
                background: cat.gradient,
                boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Project cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {projects.map((p, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div
                className="h-32 bg-cover bg-center"
                style={{ backgroundImage: `url(${categories[i].img})` }}
              />
              <div className="p-4">
                <div className="text-sm font-bold text-gray-900 mb-1">
                  {p.title}
                </div>
                <div className="text-xs text-gray-500 leading-relaxed">
                  {p.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Link
          href="/community/volunteer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-bold transition-all hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #1A3ADB, #7B2FBE)",
            boxShadow: "0 4px 14px rgba(26,58,219,0.3)",
          }}
        >
          <Heart size={15} />
          Join as Volunteer
        </Link>
      </div>
    </section>
  );
}
