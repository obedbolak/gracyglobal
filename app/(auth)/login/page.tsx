"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Chrome } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password. Please try again.");
    } else {
      router.push("/dashboard");
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  }

  return (
    <div
      className="min-h-screen flex"
      style={{
        background: "var(--bg-base)",
        backgroundImage: "var(--bg-gradient)",
      }}
    >
      {/* ── Left panel (decorative) ── */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12"
        style={{
          background:
            "linear-gradient(145deg, var(--purple-dark) 0%, var(--blue-dark) 50%, var(--scarlet-dark) 100%)",
        }}
      >
        {/* Glow blobs */}
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-80 h-80 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(220,20,60,0.3) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        {/* Shimmer overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.07) 0%, transparent 60%)",
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3"></div>

        {/* Centre quote */}
        <div className="relative z-10">
          <p className="text-4xl font-extrabold text-white leading-tight mb-6 tracking-tight">
            "Opportunity Doesn't Knock Here —<br />
            <span style={{ color: "rgba(255,255,255,0.6)" }}>
              It Has a Dashboard."
            </span>
          </p>
          <p className="text-white/50 text-sm font-light leading-relaxed max-w-sm">
            Join thousands of people across Africa using GracyGlobal to find
            work, heal, connect, and thrive.
          </p>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 flex gap-8">
          {[
            { value: "1,000+", label: "Sessions booked" },
            { value: "500+", label: "Jobs filled" },
            { value: "28", label: "Countries" },
          ].map(({ value, label }, i) => (
            <div key={i}>
              <div className="text-2xl font-extrabold text-white">{value}</div>
              <div className="text-xs text-white/45">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm"
              style={{
                background:
                  "linear-gradient(135deg, var(--purple), var(--blue))",
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
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1
              className="text-3xl font-extrabold mb-2 tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Welcome back.
            </h1>
            <p
              className="text-sm font-light"
              style={{ color: "var(--text-muted)" }}
            >
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-semibold transition-colors duration-200"
                style={{ color: "var(--accent-primary)" }}
              >
                Sign up free
              </Link>
            </p>
          </div>

          {/* Google */}
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

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className="flex-1 h-px"
              style={{ background: "var(--divider)" }}
            />
            <span
              className="text-xs font-medium"
              style={{ color: "var(--text-disabled)" }}
            >
              or sign in with email
            </span>
            <div
              className="flex-1 h-px"
              style={{ background: "var(--divider)" }}
            />
          </div>

          {/* Error */}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="relative">
              <Mail
                size={15}
                className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "var(--text-disabled)" }}
              />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3.5 text-sm rounded-2xl transition-all duration-200"
                style={{
                  background: "var(--input-bg)",
                  border: "1px solid var(--input-border)",
                  color: "var(--text-primary)",
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor =
                    "var(--input-border-focus)";
                  e.currentTarget.style.boxShadow = "var(--input-shadow-focus)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--input-border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock
                size={15}
                className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "var(--text-disabled)" }}
              />
              <input
                type={showPass ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-11 pr-12 py-3.5 text-sm rounded-2xl transition-all duration-200"
                style={{
                  background: "var(--input-bg)",
                  border: "1px solid var(--input-border)",
                  color: "var(--text-primary)",
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor =
                    "var(--input-border-focus)";
                  e.currentTarget.style.boxShadow = "var(--input-shadow-focus)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--input-border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-200"
                style={{ color: "var(--text-disabled)" }}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Remember me + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div
                  onClick={() => setRemember(!remember)}
                  className="w-4.5 w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200 flex-shrink-0"
                  style={{
                    background: remember
                      ? "linear-gradient(135deg, var(--purple), var(--blue))"
                      : "var(--input-bg)",
                    border: remember ? "none" : "1px solid var(--input-border)",
                    boxShadow: remember
                      ? "0 2px 8px rgba(123,47,190,0.35)"
                      : "none",
                  }}
                >
                  {remember && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path
                        d="M1 4L3.5 6.5L9 1"
                        stroke="white"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className="text-xs font-medium"
                  style={{ color: "var(--text-muted)" }}
                >
                  Remember me
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold transition-colors duration-200"
                style={{ color: "var(--accent-primary)" }}
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white text-sm font-bold transition-all duration-200 hover:scale-[1.01] hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2"
              style={{
                background:
                  "linear-gradient(135deg, var(--purple), var(--blue))",
                boxShadow: "0 4px 20px rgba(123,47,190,0.4)",
              }}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p
            className="text-center text-xs mt-8 leading-relaxed"
            style={{ color: "var(--text-disabled)" }}
          >
            By signing in you agree to our{" "}
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
