"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "var(--navbar-bg)" : "transparent",
        borderBottom: scrolled
          ? "1px solid var(--navbar-border)"
          : "1px solid transparent",
        boxShadow: scrolled ? "var(--navbar-shadow)" : "none",
        backdropFilter: scrolled ? "var(--navbar-blur)" : "none",
        WebkitBackdropFilter: scrolled ? "var(--navbar-blur)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-black shadow-lg transition-transform duration-200 group-hover:scale-110"
              style={{
                background:
                  "linear-gradient(135deg, var(--purple), var(--blue))",
                boxShadow: "0 4px 14px rgba(123,47,190,0.45)",
              }}
            >
              G
            </div>
            <span
              className="font-extrabold tracking-tight text-lg"
              style={{
                background:
                  "linear-gradient(135deg, var(--purple), var(--blue-light))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              GRACY GLOBAL
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3.5 py-2 text-sm font-medium rounded-xl transition-all duration-200"
                style={{
                  color: "var(--text-secondary)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "var(--btn-ghost-bg-hover)";
                  (e.currentTarget as HTMLElement).style.color =
                    "var(--accent-primary)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "transparent";
                  (e.currentTarget as HTMLElement).style.color =
                    "var(--text-secondary)";
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA + Theme toggle */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle size="sm" />
            <Link
              href="/login"
              className="text-sm font-semibold transition-colors duration-200"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.color =
                  "var(--accent-primary)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.color =
                  "var(--text-secondary)")
              }
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-5 py-2 text-sm font-bold text-white rounded-xl transition-all duration-200 hover:scale-105"
              style={{
                background:
                  "linear-gradient(135deg, var(--scarlet), var(--purple))",
                boxShadow: "0 4px 14px rgba(220,20,60,0.35)",
              }}
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle size="sm" />
            <button
              onClick={() => setOpen(!open)}
              className="p-2 rounded-xl transition-all duration-200"
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
                color: "var(--text-secondary)",
              }}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className="md:hidden px-4 pb-5 pt-2"
          style={{
            background: "var(--navbar-bg)",
            backdropFilter: "var(--navbar-blur)",
            WebkitBackdropFilter: "var(--navbar-blur)",
            borderTop: "1px solid var(--glass-border-subtle)",
          }}
        >
          <div className="space-y-0.5 mb-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "var(--btn-ghost-bg-hover)";
                  (e.currentTarget as HTMLElement).style.color =
                    "var(--accent-primary)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "transparent";
                  (e.currentTarget as HTMLElement).style.color =
                    "var(--text-secondary)";
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div
            className="flex flex-col gap-2.5 pt-3"
            style={{ borderTop: "1px solid var(--divider)" }}
          >
            <Link
              href="/login"
              className="w-full text-center py-3 text-sm font-semibold rounded-xl transition-all"
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
                color: "var(--text-secondary)",
              }}
            >
              Login
            </Link>
            <Link
              href="/register"
              className="w-full text-center py-3 text-sm font-bold text-white rounded-xl"
              style={{
                background:
                  "linear-gradient(135deg, var(--scarlet), var(--purple))",
                boxShadow: "0 4px 14px rgba(220,20,60,0.3)",
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
