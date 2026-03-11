// components/home/CounselorsSection.tsx
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
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-1">
              The Counselors
            </h2>
            <p className="text-sm text-gray-500">
              Professional guidance when you need it most.
            </p>
          </div>
          <Link
            href="/counselors"
            className="text-sm font-bold px-5 py-2 rounded-xl text-white transition-all hover:scale-105 whitespace-nowrap"
            style={{
              background: "linear-gradient(135deg, #7B2FBE, #1A3ADB)",
              boxShadow: "0 4px 14px rgba(123,47,190,0.3)",
            }}
          >
            View All
          </Link>
        </div>

        {/* Session type tabs */}
        <div className="flex gap-2 flex-wrap mb-8">
          {sessionTabs.map((tab, i) => (
            <button
              key={tab}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
              style={
                i === 0
                  ? {
                      background: "linear-gradient(135deg, #7B2FBE, #1A3ADB)",
                      color: "#fff",
                      boxShadow: "0 4px 12px rgba(123,47,190,0.3)",
                    }
                  : { background: "#F3F4F6", color: "#6B7280" }
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
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
            >
              {/* Image */}
              <div className="relative">
                <img
                  src={c.img}
                  alt={c.name}
                  className="w-full h-36 object-cover"
                />
                {c.available && (
                  <div
                    className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold"
                    style={{ background: "rgba(26,58,219,0.9)", color: "#fff" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    Live
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <div className="font-bold text-gray-900 text-sm truncate">
                  {c.name}
                </div>
                <div className="text-xs text-gray-500 mb-2 truncate">
                  {c.role}
                </div>
                <div className="flex items-center gap-1 mb-3">
                  <Star size={12} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-xs font-semibold text-gray-700">
                    {c.rating}
                  </span>
                  <span className="text-xs text-gray-400">({c.reviews})</span>
                </div>
                <Link
                  href={`/counselors/${c.id}/book`}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white transition-all hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, #7B2FBE, #DC143C)",
                    boxShadow: "0 3px 10px rgba(123,47,190,0.25)",
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
