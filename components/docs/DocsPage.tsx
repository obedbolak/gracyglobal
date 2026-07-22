"use client";

import { useState } from "react";
import Link from "next/link";
import {
  UserPlus,
  LogIn,
  User,
  Users,
  Briefcase,
  HeartHandshake,
  CreditCard,
  ChevronRight,
  ChevronDown,
  Search,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Step {
  title: string;
  description: string;
  image: string;
  tip?: string;
}

interface Section {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  steps: Step[];
}

// ── Unsplash images mapped to each section ────────────────────────────────────

const SECTIONS: Section[] = [
  {
    id: "signup",
    icon: <UserPlus size={20} />,
    title: "Creating Your Account",
    subtitle: "Get started on GracyGlobal in under 2 minutes.",
    steps: [
      {
        title: "Go to the Sign Up page",
        description:
          "Visit gracyglobal.com and click the 'Get Started' or 'Sign Up' button in the top navigation. You'll be taken to the registration form.",
        image:
          "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=900&q=80",
        tip: "You can also sign up with Google for a faster experience.",
      },
      {
        title: "Fill in your details",
        description:
          "Enter your full name, a valid email address, and a strong password. Make sure your email is one you check regularly — we'll send important updates there.",
        image:
          "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=900&q=80",
        tip: "Use at least 8 characters with a mix of letters and numbers.",
      },
      {
        title: "Verify your email",
        description:
          "Check your inbox for a verification email from GracyGlobal. Click the confirmation link inside to activate your account. Check your spam folder if you don't see it.",
        image:
          "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?auto=format&fit=crop&w=900&q=80",
      },
      {
        title: "You're in!",
        description:
          "Once verified, you'll be redirected to your dashboard. Your account is now active and ready to use.",
        image:
          "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=900&q=80",
        tip: "Complete your profile next to get the most out of GracyGlobal.",
      },
    ],
  },
  {
    id: "login",
    icon: <LogIn size={20} />,
    title: "Logging In",
    subtitle: "Access your account securely from any device.",
    steps: [
      {
        title: "Click 'Login'",
        description:
          "From the homepage, click the 'Login' button in the top right corner of the navigation bar.",
        image:
          "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=900&q=80",
      },
      {
        title: "Enter your credentials",
        description:
          "Type in your registered email address and password, then click 'Sign In'. You can also use the 'Continue with Google' option if you signed up with Google.",
        image:
          "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=900&q=80",
        tip: "Check 'Remember me' to stay logged in on your personal device.",
      },
      {
        title: "Forgot your password?",
        description:
          "Click 'Forgot password?' on the login page, enter your email, and we'll send you a reset link. The link expires after 30 minutes for security.",
        image:
          "https://images.unsplash.com/photo-1555421689-491a97ff2040?auto=format&fit=crop&w=900&q=80",
      },
    ],
  },
  {
    id: "profile",
    icon: <User size={20} />,
    title: "Setting Up Your Profile",
    subtitle: "A complete profile builds trust and opens more doors.",
    steps: [
      {
        title: "Upload a profile photo",
        description:
          "Go to your profile settings and click the avatar placeholder. Upload a clear, professional photo. Recommended size is 400×400px.",
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80",
        tip: "Profiles with photos receive 3× more engagement.",
      },
      {
        title: "Add your bio and skills",
        description:
          "Write a short bio describing who you are, your expertise, and what you're looking for on GracyGlobal. Add relevant skills so counselors and employers can find you.",
        image:
          "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=900&q=80",
      },
      {
        title: "Select your country & timezone",
        description:
          "Pick your country and timezone so we can show you relevant jobs, events, and community content for your region.",
        image:
          "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=900&q=80",
        tip: "This helps us personalise your 'My Nation & I' feed.",
      },
    ],
  },
  {
    id: "communities",
    icon: <Users size={20} />,
    title: "Joining Communities",
    subtitle: "Connect with people who share your interests and goals.",
    steps: [
      {
        title: "Browse communities",
        description:
          "Navigate to the 'Community' page from the top menu. You'll see all available communities like Health & Environment, Governance & Law, Youth Empowerment, and more.",
        image:
          "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=80",
      },
      {
        title: "Join a community",
        description:
          "Click 'Join Community' on any community card. If you're not logged in, you'll be prompted to sign in first. Once joined, you gain full access to discussions, projects, events, and resources.",
        image:
          "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80",
        tip: "You can join multiple communities at once.",
      },
      {
        title: "Post in the discussion feed",
        description:
          "Inside a community, use the message bar at the bottom to post text, images, videos, documents, or links. Press Enter or click Send to share with all members.",
        image:
          "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&w=900&q=80",
      },
      {
        title: "Switch between tabs",
        description:
          "Use the sidebar tabs — Discussions, Projects, Events, Resources, Members — to explore everything your community has to offer.",
        image:
          "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=900&q=80",
      },
    ],
  },
  {
    id: "jobs",
    icon: <Briefcase size={20} />,
    title: "Jobs & Marketplace",
    subtitle: "Find remote work or buy and sell services with ease.",
    steps: [
      {
        title: "Browse jobs",
        description:
          "Go to 'Jobs' in the navigation. Use filters like job type, category, and location to narrow down listings that match your skills.",
        image:
          "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=900&q=80",
      },
      {
        title: "Apply for a job",
        description:
          "Click on any job listing to see full details. Hit 'Apply Now', fill in the application form, and submit. You'll receive a confirmation email.",
        image:
          "https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=900&q=80",
        tip: "Make sure your profile is complete before applying — employers review it.",
      },
      {
        title: "Explore the Marketplace",
        description:
          "Visit 'Marketplace' to browse products and services offered by community members. You can also list your own services or products to sell.",
        image:
          "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=900&q=80",
      },
    ],
  },
  {
    id: "counselors",
    icon: <HeartHandshake size={20} />,
    title: "Finding a Counselor",
    subtitle:
      "Professional guidance for mental health, career, legal, and more.",
    steps: [
      {
        title: "Go to Counselors",
        description:
          "Click 'Counselors' in the top navigation. You'll see a list of verified professionals across different areas — mental health, career, legal, financial, and more.",
        image:
          "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80",
      },
      {
        title: "Filter by specialty",
        description:
          "Use the category filters to find a counselor that matches your needs. You can also filter by language and availability.",
        image:
          "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?auto=format&fit=crop&w=900&q=80",
        tip: "All counselors on GracyGlobal are verified professionals.",
      },
      {
        title: "Book a session",
        description:
          "Click on a counselor's profile to see their full bio, rates, and availability. Select a time slot and confirm your booking. You'll receive a confirmation with session details.",
        image:
          "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=900&q=80",
      },
    ],
  },
  {
    id: "plans",
    icon: <CreditCard size={20} />,
    title: "Plans & Billing",
    subtitle:
      "Choose the plan that fits your goals. Upgrade or cancel anytime.",
    steps: [
      {
        title: "View available plans",
        description:
          "Go to gracyglobal.com/plans to see all subscription options. Plans are shown in monthly and yearly billing, with yearly offering significant savings.",
        image:
          "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80",
      },
      {
        title: "Choose and subscribe",
        description:
          "Click 'Get Started' on your chosen plan. You'll be taken to a secure checkout. Enter your payment details and confirm your subscription.",
        image:
          "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=900&q=80",
        tip: "All plans include a free trial period. No charge until it ends.",
      },
      {
        title: "Manage your subscription",
        description:
          "Go to your account settings and click 'Billing' to view invoices, change your plan, or cancel at any time. Cancellations take effect at the end of your billing cycle.",
        image:
          "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=900&q=80",
      },
    ],
  },
];

// ── Step card ──────────────────────────────────────────────────────────────────

function StepCard({ step, index }: { step: Step; index: number }) {
  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start">
      {/* Step number + line */}
      <div className="flex lg:flex-col items-center gap-3 flex-shrink-0">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm text-white flex-shrink-0"
          style={{
            background:
              "linear-gradient(135deg, var(--purple), var(--scarlet))",
          }}
        >
          {index + 1}
        </div>
        <div
          className="hidden lg:block w-px flex-1 min-h-[120px]"
          style={{ background: "var(--glass-border)" }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 pb-10">
        <h4
          className="text-base font-bold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          {step.title}
        </h4>
        <p
          className="text-sm leading-relaxed mb-4"
          style={{ color: "var(--text-secondary, var(--text-muted))" }}
        >
          {step.description}
        </p>

        {/* Screenshot */}
        <div
          className="w-full rounded-2xl overflow-hidden mb-3"
          style={{ border: "1px solid var(--glass-border)" }}
        >
          <img
            src={step.image}
            alt={step.title}
            className="w-full object-cover"
            style={{ maxHeight: "260px" }}
          />
        </div>

        {/* Tip */}
        {step.tip && (
          <div
            className="flex items-start gap-2 rounded-xl px-4 py-3"
            style={{
              background: "rgba(123,47,190,0.08)",
              border: "1px solid rgba(123,47,190,0.18)",
            }}
          >
            <CheckCircle2
              size={15}
              className="flex-shrink-0 mt-0.5"
              style={{ color: "var(--purple)" }}
            />
            <p
              className="text-xs leading-relaxed font-medium"
              style={{ color: "var(--purple)" }}
            >
              {step.tip}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Section block ──────────────────────────────────────────────────────────────

function SectionBlock({ section }: { section: Section }) {
  const [open, setOpen] = useState(true);

  return (
    <div
      id={section.id}
      className="rounded-2xl overflow-hidden"
      style={{
        border: "1px solid var(--glass-border)",
        background: "var(--glass-bg)",
      }}
    >
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-5 text-left transition-colors hover:opacity-80"
      >
        <div className="flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
            style={{
              background:
                "linear-gradient(135deg, var(--purple), var(--scarlet))",
            }}
          >
            {section.icon}
          </div>
          <div>
            <h3
              className="text-base font-extrabold"
              style={{ color: "var(--text-primary)" }}
            >
              {section.title}
            </h3>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              {section.subtitle}
            </p>
          </div>
        </div>
        <ChevronDown
          size={18}
          style={{
            color: "var(--text-muted)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        />
      </button>

      {/* Steps */}
      {open && (
        <div
          className="px-6 pb-2 pt-2"
          style={{ borderTop: "1px solid var(--glass-border)" }}
        >
          {section.steps.map((step, i) => (
            <StepCard key={i} step={step} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Sidebar nav ────────────────────────────────────────────────────────────────

function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col gap-2 w-60 flex-shrink-0 sticky top-24">
      <p
        className="text-[11px] font-bold uppercase tracking-widest mb-2 px-1"
        style={{ color: "var(--text-muted)" }}
      >
        On this page
      </p>
      {SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.01]"
          style={{
            color: "var(--text-secondary, var(--text-muted))",
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <span style={{ color: "var(--purple)" }}>{s.icon}</span>
          {s.title}
        </a>
      ))}

      {/* Help box */}
      <div
        className="mt-4 rounded-2xl p-4"
        style={{
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
        }}
      >
        <p
          className="text-xs font-bold mb-1"
          style={{ color: "var(--text-primary)" }}
        >
          Still need help?
        </p>
        <p className="text-[11px] mb-3" style={{ color: "var(--text-muted)" }}>
          Our support team is always here for you.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-1.5 text-xs font-semibold"
          style={{ color: "var(--purple)" }}
        >
          Contact support <ArrowRight size={12} />
        </Link>
      </div>
    </aside>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function DocsPage() {
  const [search, setSearch] = useState("");

  const filtered = SECTIONS.filter(
    (s) =>
      !search.trim() ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.steps.some(
        (st) =>
          st.title.toLowerCase().includes(search.toLowerCase()) ||
          st.description.toLowerCase().includes(search.toLowerCase()),
      ),
  );

  return (
    <main className="min-h-screen pb-20">
      {/* Hero */}
      <section
        className="relative px-4 pt-16 pb-12 text-center overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, rgba(123,47,190,0.08) 0%, rgba(220,38,38,0.06) 100%)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(123,47,190,0.12), transparent)",
          }}
        />
        <h1
          className="text-3xl sm:text-4xl font-extrabold mb-3 relative"
          style={{ color: "var(--text-primary)" }}
        >
          GracyGlobal{" "}
          <span
            style={{
              background:
                "linear-gradient(135deg, var(--purple), var(--scarlet))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Docs
          </span>
        </h1>
        <p
          className="text-sm max-w-md mx-auto mb-8 relative"
          style={{ color: "var(--text-muted)" }}
        >
          Step-by-step guides to help you get the most out of every feature on
          GracyGlobal.
        </p>

        {/* Search */}
        <div className="relative max-w-md mx-auto">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search docs…"
            className="w-full rounded-xl py-3 pl-11 pr-4 text-sm outline-none"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
              color: "var(--text-primary)",
              backdropFilter: "blur(8px)",
            }}
          />
        </div>

        {/* Quick links */}
        <div className="flex flex-wrap justify-center gap-2 mt-6 relative">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:scale-105"
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
                color: "var(--text-secondary, var(--text-muted))",
              }}
            >
              {s.icon}
              {s.title}
              <ChevronRight size={12} />
            </a>
          ))}
        </div>
      </section>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex gap-10 items-start">
          <Sidebar />

          <div className="flex-1 min-w-0 flex flex-col gap-6">
            {filtered.length === 0 ? (
              <div
                className="rounded-2xl px-6 py-16 text-center text-sm"
                style={{
                  border: "1px solid var(--glass-border)",
                  color: "var(--text-muted)",
                }}
              >
                No results for "{search}". Try a different term.
              </div>
            ) : (
              filtered.map((section) => (
                <SectionBlock key={section.id} section={section} />
              ))
            )}

            {/* Footer CTA */}
            <div
              className="rounded-2xl p-8 text-center mt-4"
              style={{
                background:
                  "linear-gradient(135deg, rgba(123,47,190,0.1), rgba(220,38,38,0.08))",
                border: "1px solid var(--glass-border)",
              }}
            >
              <h3
                className="text-lg font-extrabold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Ready to get started?
              </h3>
              <p
                className="text-sm mb-6"
                style={{ color: "var(--text-muted)" }}
              >
                Join thousands of Africans and the diaspora already using
                GracyGlobal.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-all hover:scale-105"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--purple), var(--scarlet))",
                  }}
                >
                  Create free account <ArrowRight size={15} />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all hover:opacity-80"
                  style={{
                    background: "var(--glass-bg)",
                    border: "1px solid var(--glass-border)",
                    color: "var(--text-primary)",
                  }}
                >
                  <ExternalLink size={15} /> Contact support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
