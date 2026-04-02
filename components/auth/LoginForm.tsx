// components/auth/LoginForm.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Chrome } from "lucide-react";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setLoading(false);
        setError("Invalid email or password. Please try again.");
        return;
      }

      if (res?.ok) {
        // Fetch user session to get role
        const sessionResponse = await fetch("/api/auth/session");
        const session = await sessionResponse.json();

        if (session?.user) {
          // Role-based redirect
          const role = session.user.role;
          let redirectUrl = "/dashboard"; // Default

          if (callbackUrl) {
            redirectUrl = callbackUrl;
          } else {
            switch (role) {
              case "ADMIN":
                redirectUrl = "/admin";
                break;
              case "COUNSELOR":
                redirectUrl = "/counselor/dashboard";
                break;
              case "VOLUNTEER":
                redirectUrl = "/volunteer/dashboard";
                break;
              default:
                redirectUrl = "/dashboard";
            }
          }

          window.location.href = redirectUrl;
        } else {
          window.location.href = "/dashboard";
        }
      }
    } catch (err) {
      setLoading(false);
      setError("Something went wrong. Please try again.");
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    const callback = callbackUrl || "/dashboard";
    await signIn("google", { callbackUrl: callback });
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setForgotLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      if (response.ok) {
        setForgotSuccess(true);
      } else {
        setError("Failed to send reset link. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setForgotLoading(false);
    }
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
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.07) 0%, transparent 60%)",
          }}
        />

        <div className="relative z-10 flex items-center gap-3"></div>

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
          <div className="mb-8">
            <h1
              className="text-3xl font-extrabold mb-2 tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {showForgotPassword ? "Reset Password" : "Welcome back."}
            </h1>
            <p
              className="text-sm font-light"
              style={{ color: "var(--text-muted)" }}
            >
              {showForgotPassword ? (
                <>
                  Remember your password?{" "}
                  <button
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotSuccess(false);
                      setForgotEmail("");
                    }}
                    className="font-semibold transition-colors duration-200"
                    style={{ color: "var(--accent-primary)" }}
                  >
                    Back to login
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{" "}
                  <Link
                    href="/register"
                    className="font-semibold transition-colors duration-200"
                    style={{ color: "var(--accent-primary)" }}
                  >
                    Sign up free
                  </Link>
                </>
              )}
            </p>
          </div>

          {!showForgotPassword && (
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
          )}

          {!showForgotPassword && (
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
          )}

          {error && !showForgotPassword && (
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

          {showForgotPassword ? (
            forgotSuccess ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #10b981, var(--blue))",
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M7 12L10 15L17 8"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3
                  className="text-xl font-bold mb-3"
                  style={{ color: "var(--text-primary)" }}
                >
                  Reset link sent!
                </h3>
                <p
                  className="text-sm mb-8"
                  style={{ color: "var(--text-muted)" }}
                >
                  Check your email for the password reset link.
                </p>
              </motion.div>
            ) : (
              <motion.form
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={handleForgotPassword}
                className="flex flex-col gap-4"
              >
                <p
                  className="text-sm mb-4"
                  style={{ color: "var(--text-muted)" }}
                >
                  Enter your email address and we'll send you a link to reset
                  your password.
                </p>

                <div className="relative">
                  <Mail
                    size={15}
                    className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: "var(--text-disabled)" }}
                  />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    className="glass-input w-full pl-11 pr-4 py-3.5 text-sm rounded-2xl"
                  />
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl mt-2"
                >
                  {forgotLoading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Send Reset Link <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </motion.form>
            )
          ) : (
            <motion.form
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
            >
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
                  className="glass-input w-full pl-11 pr-4 py-3.5 text-sm rounded-2xl"
                />
              </div>

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
                  className="glass-input w-full pl-11 pr-12 py-3.5 text-sm rounded-2xl"
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

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <div
                    onClick={() => setRemember(!remember)}
                    className="w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200"
                    style={{
                      background: remember
                        ? "linear-gradient(135deg, var(--purple), var(--blue))"
                        : "var(--input-bg)",
                      border: remember
                        ? "none"
                        : "1px solid var(--input-border)",
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
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs font-semibold"
                  style={{ color: "var(--accent-primary)" }}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl mt-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In <ArrowRight size={15} />
                  </>
                )}
              </button>
            </motion.form>
          )}

          <p
            className="text-center text-xs mt-8"
            style={{ color: "var(--text-disabled)" }}
          >
            By signing in you agree to our{" "}
            <Link href="/terms" className="underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline">
              Privacy Policy
            </Link>
            .
          </p>
        </motion.div>
      </div>
    </div>
  );
}
