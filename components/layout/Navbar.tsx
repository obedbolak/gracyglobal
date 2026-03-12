// components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Counselors", href: "/counselors" },
  { label: "Remote Jobs", href: "/jobs" },
  { label: "My Nation & I", href: "/community" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "Blog", href: "/blog" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-black"
              style={{
                background: "linear-gradient(135deg, #7B2FBE, #1A3ADB)",
              }}
            >
              G
            </div>
            <span
              className="text-gradient-pb font-extrabold tracking-tight text-xl"
              style={{
                background: "linear-gradient(135deg, #7B2FBE, #1A3ADB)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              GRACY GLOBAL
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-purple-700 rounded-lg hover:bg-purple-50 transition-all duration-200"
                style={{ "--tw-text-opacity": "1" } as React.CSSProperties}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-gray-700 hover:text-purple-700 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-bold text-white rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg"
              style={{
                background: "linear-gradient(135deg, #DC143C, #7B2FBE)",
                boxShadow: "0 4px 14px rgba(220,20,60,0.3)",
              }}
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4 pt-2 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-purple-50 hover:text-purple-700 transition"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 flex flex-col gap-2">
            <Link
              href="/login"
              className="w-full text-center py-2.5 text-sm font-semibold border border-gray-200 rounded-xl text-gray-700"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="w-full text-center py-2.5 text-sm font-bold text-white rounded-xl"
              style={{
                background: "linear-gradient(135deg, #DC143C, #7B2FBE)",
              }}
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
