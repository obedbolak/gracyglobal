"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { validateEmail, validateName } from "@/lib/utils";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Globe,
  ArrowRight,
  Chrome,
  Check,
} from "lucide-react";

const COUNTRIES = [
  "Cameroon",
  "Nigeria",
  "Ghana",
  "Kenya",
  "South Africa",
  "Ivory Coast",
  "Senegal",
  "Uganda",
  "Tanzania",
  "Ethiopia",
  "Rwanda",
  "Zambia",
  "Zimbabwe",
  "Mozambique",
  "Angola",
  "Mali",
  "Burkina Faso",
  "Niger",
  "Chad",
  "Sudan",
  "Egypt",
  "Morocco",
  "Algeria",
  "Tunisia",
  "United Kingdom",
  "United States",
  "Canada",
  "France",
  "Germany",
  "Other",
];

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /[0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const colors = [
    "var(--error-text)",
    "var(--warning-text)",
    "var(--success-text)",
  ];
  const labels = ["Weak", "Fair", "Strong"];
  if (!password) return null;
  return (
    <div className="flex flex-col gap-2 mt-1">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{
              background:
                i < score ? colors[score - 1] : "var(--glass-bg-subtle)",
            }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          {checks.map(({ label, pass }) => (
            <span
              key={label}
              className="flex items-center gap-1 text-[10px]"
              style={{
                color: pass ? "var(--success-text)" : "var(--text-disabled)",
              }}
            >
              {pass && <Check size={9} strokeWidth={3} />}
              {label}
            </span>
          ))}
        </div>
        <span
          className="text-[10px] font-bold"
          style={{ color: colors[score - 1] }}
        >
          {score > 0 ? labels[score - 1] : ""}
        </span>
      </div>
    </div>
  );
}

// ── Must be isolated so Suspense can wrap just this part ─────────────────────
function AffiliateRefCapture() {
  const searchParams = useSearchParams();
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      document.cookie = `ref=${encodeURIComponent(ref)}; max-age=${60 * 60 * 24 * 30}; path=/; SameSite=Lax`;
    }
  }, [searchParams]);
  return null;
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    country: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"form" | "otp">("form");
  const [otp, setOtp] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (step === "form") {
      // Validate name
      const nameValidation = validateName(form.name);
      if (!nameValidation.isValid) {
        setError(nameValidation.error || "Invalid name");
        return;
      }

      // Validate email
      const emailValidation = validateEmail(form.email);
      if (!emailValidation.isValid) {
        setError(emailValidation.error || "Invalid email");
        return;
      }

      if (form.password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }
      setLoading(true);
      try {
        const res = await fetch("/api/auth/send-registration-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, role: ["USER"] }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Something went wrong.");
          setLoading(false);
          return;
        }
        setStep("otp");
      } catch {
        setError("Network error. Please check your connection.");
      }
      setLoading(false);
    } else {
      if (!otp) {
        setError("Please enter the OTP.");
        return;
      }
      setLoading(true);
      try {
        const res = await fetch("/api/auth/verify-registration-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, otp }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Something went wrong.");
          setLoading(false);
          return;
        }
        await signIn("credentials", {
          email: form.email,
          password: form.password,
          redirect: false,
        });
        router.push("/dashboard");
      } catch {
        setError("Network error. Please check your connection.");
      }
      setLoading(false);
    }
  }

  async function handleResend() {
    setResendLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/send-registration-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role: ["USER"] }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Failed to resend OTP.");
    } catch {
      setError("Network error.");
    }
    setResendLoading(false);
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  }

  const inputStyle = {
    background: "var(--input-bg)",
    border: "1px solid var(--input-border)",
    color: "var(--text-primary)",
    outline: "none",
  };
  function onFocus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    e.currentTarget.style.borderColor = "var(--input-border-focus)";
    e.currentTarget.style.boxShadow = "var(--input-shadow-focus)";
  }
  function onBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    e.currentTarget.style.borderColor = "var(--input-border)";
    e.currentTarget.style.boxShadow = "none";
  }

  return (
    <div
      className="min-h-screen flex"
      style={{
        background: "var(--bg-base)",
        backgroundImage: "var(--bg-gradient)",
      }}
    >
      {/* ── Cookie capture — wrapped in Suspense (Next.js 14+ requirement) ── */}
      <Suspense fallback={null}>
        <AffiliateRefCapture />
      </Suspense>

      {/* ── Left panel ── */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12"
        style={{
          background:
            "linear-gradient(145deg, var(--scarlet-dark) 0%, var(--purple-dark) 50%, var(--blue-dark) 100%)",
        }}
      >
        <div
          className="absolute -top-32 -right-20 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(123,47,190,0.3) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div className="relative z-10 flex items-center gap-3" />
        <div className="relative z-10">
          <p className="text-4xl font-extrabold text-white leading-tight mb-6 tracking-tight">
            "Your Ambition Just
            <br />
            <span style={{ color: "rgba(255,255,255,0.55)" }}>
              Found Its Home Address."
            </span>
          </p>
          <p className="text-white/50 text-sm font-light leading-relaxed max-w-sm">
            Counseling, remote jobs, community, and commerce — all in one place
            built for Africa and the world.
          </p>
        </div>
        <div className="relative z-10 flex flex-col gap-3">
          {[
            "Free to join — no hidden fees",
            "Book counselors in under 2 minutes",
            "Browse 500+ remote job listings",
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 text-sm text-white/70"
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.15)" }}
              >
                <Check size={11} className="text-white" strokeWidth={3} />
              </div>
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <h1
              className="text-3xl font-extrabold mb-2 tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {step === "form" ? "Create your account." : "Verify your email"}
            </h1>
            <p
              className="text-sm font-light"
              style={{ color: "var(--text-muted)" }}
            >
              {step === "form" ? (
                <>
                  {" "}
                  Already have one?{" "}
                  <Link
                    href="/login"
                    className="font-semibold"
                    style={{ color: "var(--accent-primary)" }}
                  >
                    Sign in
                  </Link>
                </>
              ) : (
                <>We've sent a 6-digit code to {form.email}</>
              )}
            </p>
          </div>

          {step === "form" && (
            <>
              <button
                onClick={handleGoogle}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 hover:scale-[1.01] mb-6 disabled:opacity-60"
                style={{
                  background: "var(--glass-bg)",
                  border: "1px solid var(--glass-border)",
                  color: "var(--text-secondary)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "var(--glass-shadow)",
                }}
              >
                {googleLoading ? (
                  <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                ) : (
                  <Chrome size={17} />
                )}
                Continue with Google
              </button>
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="flex-1 h-px"
                  style={{ background: "var(--divider)" }}
                />
                <span
                  className="text-xs font-medium"
                  style={{ color: "var(--text-disabled)" }}
                >
                  or register with email
                </span>
                <div
                  className="flex-1 h-px"
                  style={{ background: "var(--divider)" }}
                />
              </div>
            </>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl mb-5 text-sm"
              style={{
                background: "var(--error-bg)",
                border: "1px solid var(--error-border)",
                color: "var(--error-text)",
              }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {step === "form" ? (
              <>
                <div className="relative">
                  <User
                    size={15}
                    className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: "var(--text-disabled)" }}
                  />
                  <input
                    type="text"
                    placeholder="Full name"
                    required
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 text-sm rounded-2xl transition-all duration-200"
                    style={inputStyle}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </div>
                <div className="relative">
                  <Mail
                    size={15}
                    className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: "var(--text-disabled)" }}
                  />
                  <input
                    type="email"
                    placeholder="Email address"
                    required
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 text-sm rounded-2xl transition-all duration-200"
                    style={inputStyle}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </div>
                <div className="relative">
                  <Phone
                    size={15}
                    className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: "var(--text-disabled)" }}
                  />
                  <input
                    type="tel"
                    placeholder="Phone number (e.g. +237 6XX XXX XXX)"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 text-sm rounded-2xl transition-all duration-200"
                    style={inputStyle}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </div>
                <div className="relative">
                  <Globe
                    size={15}
                    className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10"
                    style={{ color: "var(--text-disabled)" }}
                  />
                  <select
                    value={form.country}
                    onChange={(e) => update("country", e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 text-sm rounded-2xl transition-all duration-200 appearance-none cursor-pointer"
                    style={{
                      ...inputStyle,
                      color: form.country
                        ? "var(--text-primary)"
                        : "var(--text-disabled)",
                    }}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  >
                    <option value="" disabled>
                      Select your country
                    </option>
                    {COUNTRIES.map((c) => (
                      <option
                        key={c}
                        value={c}
                        style={{
                          background: "var(--bg-base)",
                          color: "var(--text-primary)",
                        }}
                      >
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="relative">
                    <Lock
                      size={15}
                      className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: "var(--text-disabled)" }}
                    />
                    <input
                      type={showPass ? "text" : "password"}
                      placeholder="Create a password"
                      required
                      value={form.password}
                      onChange={(e) => update("password", e.target.value)}
                      className="w-full pl-11 pr-12 py-3.5 text-sm rounded-2xl transition-all duration-200"
                      style={inputStyle}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--text-disabled)" }}
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <PasswordStrength password={form.password} />
                </div>
              </>
            ) : (
              <>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: "var(--text-disabled)" }}
                  />
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    required
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    className="w-full pl-11 pr-4 py-3.5 text-sm rounded-2xl transition-all duration-200 text-center font-mono text-lg tracking-widest"
                    style={inputStyle}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    maxLength={6}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="text-xs font-medium self-start"
                  style={{ color: "var(--accent-primary)" }}
                >
                  {resendLoading ? "Sending..." : "Didn't receive code? Resend"}
                </button>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white text-sm font-bold transition-all duration-200 hover:scale-[1.01] hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2"
              style={{
                background:
                  "linear-gradient(135deg, var(--scarlet), var(--purple))",
                boxShadow: "0 4px 20px rgba(220,20,60,0.35)",
              }}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {step === "form"
                    ? "Send Verification Code"
                    : "Verify & Create Account"}{" "}
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <p
            className="text-center text-xs mt-8 leading-relaxed"
            style={{ color: "var(--text-disabled)" }}
          >
            By registering you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-2">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-2">
              Privacy Policy
            </Link>
            .
          </p>
        </motion.div>
      </div>
    </div>
  );
}
