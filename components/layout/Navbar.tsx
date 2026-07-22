"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, ShoppingBag, User, LogOut, Search, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "next-auth/react";

const navLinks = [
  { label: "Counselors", href: "/counselors" },
  { label: "Jobs", href: "/jobs" },
  { label: "Community", href: "/community" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "Services", href: "/services" },
  { label: "E-learning", href: "/learn" },
  { label: "Affiliate", href: "/affiliate" },
];

export default function Navbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { count } = useCart();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-profile-menu]")) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function submitSearch(e?: React.FormEvent) {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setOpen(false);
    setQuery("");
  }

  return (
    <>
      <nav
        className="sticky top-0 z-50 transition-all duration-300 relative"
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
          <div className="flex items-center justify-between h-16 gap-2">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2.5 group flex-shrink-0"
            >
              <span
                className="font-extrabold tracking-tight text-base sm:text-lg"
                style={{
                  background:
                    "linear-gradient(135deg, var(--purple), var(--blue-light))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                <Image src="/favicon.ico" alt="Logo" width={32} height={32} />
              </span>
            </Link>

            {/* Desktop links — only at lg+ */}
            <div className="hidden lg:flex items-center justify-center flex-1 gap-1 mx-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 whitespace-nowrap"
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

            {/* Desktop right cluster (lg+): search + theme + cart + profile */}
            <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
              <form onSubmit={submitSearch} className="relative flex items-center mr-2">
                <Search
                  size={16}
                  className="absolute left-3 pointer-events-none"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-48 xl:w-56 py-1.5 pl-9 pr-8 text-sm rounded-full outline-none transition-all duration-300 focus:w-64"
                  style={{
                    background: "var(--glass-bg)",
                    border: "1px solid var(--glass-border)",
                    color: "var(--text-primary)",
                  }}
                />
                {query.trim() && (
                  <button
                    type="submit"
                    className="absolute right-2 p-1 rounded-full transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-border)]"
                    aria-label="Submit search"
                  >
                    <ArrowRight size={14} />
                  </button>
                )}
              </form>

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
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center text-white"
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

              {/* Profile menu */}
              <div className="relative" data-profile-menu>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="relative p-2 rounded-xl transition-all duration-200 hover:scale-105 flex items-center gap-2"
                  style={{
                    background: "var(--glass-bg)",
                    border: "1px solid var(--glass-border)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {isAuthenticated && user?.image ? (
                    <img
                      src={user.image}
                      alt={user.name || "Profile"}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <User size={18} />
                  )}
                </button>

                {showProfileMenu && (
                  <div
                    className="absolute right-0 mt-2 w-52 rounded-xl overflow-hidden shadow-lg"
                    style={{
                      background: "var(--glass-bg)",
                      border: "1px solid var(--glass-border)",
                      backdropFilter: "blur(12px)",
                    }}
                  >
                    {isAuthenticated ? (
                      <>
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
                          className="flex items-center gap-2 px-3 py-2.5 text-sm transition-all duration-200"
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
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-all duration-200"
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
                      </>
                    ) : (
                      <>
                        <div
                          className="p-3 border-b"
                          style={{ borderColor: "var(--divider)" }}
                        >
                          <p
                            className="text-xs font-medium"
                            style={{ color: "var(--text-muted)" }}
                          >
                            Welcome to Gracy Global
                          </p>
                          <p
                            className="text-sm font-semibold mt-0.5"
                            style={{ color: "var(--text-primary)" }}
                          >
                            Sign in to get started
                          </p>
                        </div>
                        <Link
                          href="/login"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium transition-all duration-200"
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
                          <LogOut
                            size={16}
                            style={{ transform: "scaleX(-1)" }}
                          />
                          Login
                        </Link>
                        <div
                          className="p-2"
                          style={{ borderTop: "1px solid var(--divider)" }}
                        >
                          <Link
                            href="/register"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center justify-center gap-2 w-full py-2 text-sm font-bold text-white rounded-xl transition-all duration-200 hover:scale-[1.02]"
                            style={{
                              background:
                                "linear-gradient(135deg, var(--scarlet), var(--purple))",
                              boxShadow: "0 4px 14px rgba(220,20,60,0.35)",
                            }}
                          >
                            Sign Up
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile / tablet cluster (< lg): search + theme + cart + hamburger */}
            <div className={`flex lg:hidden items-center gap-1.5 sm:gap-2 transition-all duration-300 ${isSearchFocused ? "flex-1 ml-4" : "flex-shrink-0"}`}>
              <form onSubmit={submitSearch} className={`relative flex items-center ${isSearchFocused ? "w-full" : "mr-1"}`}>
                <Search
                  size={14}
                  className="absolute left-2.5 pointer-events-none"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  placeholder="Search..."
                  className={`py-1.5 pl-8 pr-8 text-xs rounded-full outline-none transition-all duration-300 ${isSearchFocused ? "w-full" : "w-28 sm:w-36"}`}
                  style={{
                    background: "var(--glass-bg)",
                    border: "1px solid var(--glass-border)",
                    color: "var(--text-primary)",
                  }}
                />
                {query.trim() && (
                  <button
                    type="submit"
                    className="absolute right-1.5 p-1 rounded-full transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-border)]"
                    aria-label="Submit search"
                  >
                    <ArrowRight size={12} />
                  </button>
                )}
              </form>

              {!isSearchFocused && (
                <>
                  <ThemeToggle size="sm" />

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
                    aria-label="Toggle menu"
                    className="p-2 rounded-xl transition-all duration-200"
                    style={{
                      background: "var(--glass-bg)",
                      border: "1px solid var(--glass-border)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {open ? <X size={20} /> : <Menu size={20} />}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile / tablet menu (< lg) */}
        {open && (
          <div
            className="lg:hidden px-4 pb-5 pt-2"
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

    </>
  );
}
