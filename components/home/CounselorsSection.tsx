import Link from "next/link";
import { Star, Calendar } from "lucide-react";

const counselors = [
  {
    id: "1",
    name: "Daniel Evans",
    role: "Relationship Counselor",
    rating: 4.8,
    reviews: 120,
    img: "https://randomuser.me/api/portraits/men/32.jpg",
    available: true,
  },
  {
    id: "2",
    name: "Grace Nfor",
    role: "Emotional Wellness",
    rating: 4.9,
    reviews: 98,
    img: "https://randomuser.me/api/portraits/women/44.jpg",
    available: true,
  },
  {
    id: "3",
    name: "Dr. Michael",
    role: "Life Coach",
    rating: 4.7,
    reviews: 215,
    img: "https://randomuser.me/api/portraits/men/52.jpg",
    available: false,
  },
  {
    id: "4",
    name: "Sarah Johnson",
    role: "Family Counselor",
    rating: 4.8,
    reviews: 87,
    img: "https://randomuser.me/api/portraits/women/68.jpg",
    available: true,
  },
];

const sessionTabs = ["Text Counseling", "Video Counseling", "Support Groups"];

export default function CounselorsSection() {
  return (
    <section className="py-16 relative">
      {/* Subtle section bg */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "var(--glass-bg-subtle)" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2
              className="text-2xl font-extrabold mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              The Counselors
            </h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Professional guidance when you need it most.
            </p>
          </div>
          <Link
            href="/counselors"
            className="text-sm font-bold px-5 py-2.5 rounded-xl text-white transition-all hover:scale-105 whitespace-nowrap"
            style={{
              background: "linear-gradient(135deg, var(--purple), var(--blue))",
              boxShadow: "var(--btn-primary-shadow)",
            }}
          >
            View All
          </Link>
        </div>

        {/* Session tabs */}
        <div className="flex gap-2 flex-wrap mb-8">
          {sessionTabs.map((tab, i) => (
            <button
              key={tab}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
              style={
                i === 0
                  ? {
                      background:
                        "linear-gradient(135deg, var(--purple), var(--blue))",
                      color: "#fff",
                      boxShadow: "var(--btn-primary-shadow)",
                    }
                  : {
                      background: "var(--glass-bg)",
                      border: "1px solid var(--glass-border)",
                      color: "var(--text-muted)",
                      backdropFilter: "blur(10px)",
                    }
              }
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Counselor cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {counselors.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 group"
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--card-border)",
                boxShadow: "var(--card-shadow)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
              }}
            >
              {/* Avatar */}
              <div className="relative overflow-hidden">
                <img
                  src={c.img}
                  alt={c.name}
                  className="w-full h-36 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Glass overlay on image */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.3) 100%)",
                  }}
                />
                {c.available && (
                  <div
                    className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-white"
                    style={{
                      background: "rgba(26,58,219,0.85)",
                      backdropFilter: "blur(8px)",
                      border: "1px solid rgba(255,255,255,0.25)",
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.8)]" />
                    Live
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3.5">
                <div
                  className="font-bold text-sm truncate mb-0.5"
                  style={{ color: "var(--text-primary)" }}
                >
                  {c.name}
                </div>
                <div
                  className="text-xs mb-2 truncate"
                  style={{ color: "var(--text-muted)" }}
                >
                  {c.role}
                </div>
                <div className="flex items-center gap-1 mb-3.5">
                  <Star size={12} className="text-yellow-400 fill-yellow-400" />
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {c.rating}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    ({c.reviews})
                  </span>
                </div>
                <Link
                  href={`/counselors/${c.id}/book`}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white transition-all hover:scale-105"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--purple), var(--scarlet))",
                    boxShadow: "0 3px 10px rgba(123,47,190,0.30)",
                  }}
                >
                  <Calendar size={12} />
                  Book Session
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
