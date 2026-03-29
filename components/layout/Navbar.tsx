"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, ShoppingBag, User, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "next-auth/react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Counselors", href: "/counselors" },
  { label: "Remote Jobs", href: "/jobs" },
  { label: "My Nation & I", href: "/community" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "Services", href: "/services" },
  { label: "E-learning", href: "/learn" },
  { label: "Affiliate", href: "/affiliate" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { count } = useCart();
  const { isAuthenticated, user } = useAuth();

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

          {/* CTA + Theme toggle + Cart + Profile */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle size="sm" />

            {/* Cart icon */}
            <Link
              href="/marketplace/cart"
              className="relative p-2 rounded-xl transition-all duration-200 hover:scale-105"
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
                color: "var(--text-secondary)",
              }}
            >
              <ShoppingBag size={18} />
              {count > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 w-4.5 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--scarlet), var(--purple))",
                    boxShadow: "0 2px 8px rgba(220,20,60,0.4)",
                  }}
                >
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="relative p-2 rounded-xl transition-all duration-200 hover:scale-105 flex items-center gap-2"
                  style={{
                    background: "var(--glass-bg)",
                    border: "1px solid var(--glass-border)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt={user.name || "Profile"}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <User size={18} />
                  )}
                </button>

                {/* Profile dropdown */}
                {showProfileMenu && (
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-xl overflow-hidden shadow-lg"
                    style={{
                      background: "var(--glass-bg)",
                      border: "1px solid var(--glass-border)",
                      backdropFilter: "blur(12px)",
                    }}
                  >
                    <div
                      className="p-3 border-b"
                      style={{ borderColor: "var(--divider)" }}
                    >
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {user?.name || "User"}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {user?.email}
                      </p>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm transition-all duration-200"
                      style={{ color: "var(--text-secondary)" }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background =
                          "var(--btn-ghost-bg-hover)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background =
                          "transparent";
                      }}
                    >
                      <User size={16} />
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-all duration-200"
                      style={{ color: "var(--error-text)" }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background =
                          "var(--error-bg)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background =
                          "transparent";
                      }}
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle size="sm" />

            {/* Mobile cart */}
            <Link
              href="/marketplace/cart"
              className="relative p-2 rounded-xl transition-all duration-200"
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
                color: "var(--text-secondary)",
              }}
            >
              <ShoppingBag size={18} />
              {count > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--scarlet), var(--purple))",
                  }}
                >
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>

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
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl transition-all"
                  style={{
                    background: "var(--glass-bg)",
                    border: "1px solid var(--glass-border)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <User size={16} />
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    setOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl transition-all"
                  style={{
                    background: "var(--error-bg)",
                    border: "1px solid var(--error-border)",
                    color: "var(--error-text)",
                  }}
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
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
                  onClick={() => setOpen(false)}
                  className="w-full text-center py-3 text-sm font-bold text-white rounded-xl"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--scarlet), var(--purple))",
                    boxShadow: "0 4px 14px rgba(220,20,60,0.3)",
                  }}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
