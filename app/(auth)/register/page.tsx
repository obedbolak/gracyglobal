"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
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
  ChevronDown,
} from "lucide-react";

// ── Country codes (Cameroon default + 8 others) ───────────────────────────────
const COUNTRY_CODES = [
  { code: "+237", country: "Cameroon", flag: "🇨🇲", iso: "CM" },
  { code: "+234", country: "Nigeria", flag: "🇳🇬", iso: "NG" },
  { code: "+233", country: "Ghana", flag: "🇬🇭", iso: "GH" },
  { code: "+254", country: "Kenya", flag: "🇰🇪", iso: "KE" },
  { code: "+27", country: "South Africa", flag: "🇿🇦", iso: "ZA" },
  { code: "+225", country: "Ivory Coast", flag: "🇨🇮", iso: "CI" },
  { code: "+221", country: "Senegal", flag: "🇸🇳", iso: "SN" },
  { code: "+256", country: "Uganda", flag: "🇺🇬", iso: "UG" },
  { code: "+255", country: "Tanzania", flag: "🇹🇿", iso: "TZ" },
  { code: "+250", country: "Rwanda", flag: "🇷🇼", iso: "RW" },
];

const COUNTRY_CODE_BY_COUNTRY = Object.fromEntries(
  COUNTRY_CODES.map((c) => [c.country, c.code]),
);
const COUNTRY_BY_CODE = Object.fromEntries(
  COUNTRY_CODES.map((c) => [c.code, c.country]),
);

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

type RegisterMode = "email" | "phone";

// ── Password strength ─────────────────────────────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ chars", pass: password.length >= 8 },
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

// ── Affiliate ref ─────────────────────────────────────────────────────────────
function AffiliateRefCapture() {
  const searchParams = useSearchParams();
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref)
      document.cookie = `ref=${encodeURIComponent(ref)}; max-age=${60 * 60 * 24 * 30}; path=/; SameSite=Lax`;
  }, [searchParams]);
  return null;
}
// ── Mode toggle ───────────────────────────────────────────────────────────────
function ModeToggle({
  mode,
  onChange,
}: {
  mode: RegisterMode;
  onChange: (m: RegisterMode) => void;
}) {
  return (
    <div
      className="flex rounded-2xl p-1 mb-6"
      style={{
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-border)",
        backdropFilter: "blur(12px)",
      }}
    >
      {(["email", "phone"] as RegisterMode[]).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
          style={{
            background:
              mode === m
                ? "linear-gradient(135deg, var(--scarlet), var(--purple))"
                : "transparent",
            color: mode === m ? "#fff" : "var(--text-muted)",
            boxShadow: mode === m ? "0 2px 12px rgba(220,20,60,0.3)" : "none",
          }}
        >
          {m === "email" ? <Mail size={14} /> : <Phone size={14} />}
          {m === "email" ? "Email" : "Phone number"}
        </button>
      ))}
    </div>
  );
}

// ── Phone input ───────────────────────────────────────────────────────────────
function PhoneInput({
  countryCode,
  number,
  onCountryChange,
  onNumberChange,
  inputStyle,
  onFocus,
  onBlur,
}: {
  countryCode: string;
  number: string;
  onCountryChange: (c: string) => void;
  onNumberChange: (n: string) => void;
  inputStyle: React.CSSProperties;
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => void;
}) {
  const selected =
    COUNTRY_CODES.find((c) => c.code === countryCode) ?? COUNTRY_CODES[0];

  return (
    <div className="flex gap-2">
      {/* Country code */}
      <div className="relative flex-shrink-0">
        <select
          value={countryCode}
          onChange={(e) => onCountryChange(e.target.value)}
          className="appearance-none pl-3 pr-8 py-3.5 text-sm rounded-2xl transition-all duration-200 cursor-pointer font-semibold h-full"
          style={{
            ...inputStyle,
            minWidth: "105px",
            color: "var(--text-primary)",
          }}
          onFocus={onFocus}
          onBlur={onBlur}
        >
          {COUNTRY_CODES.map((c) => (
            <option
              key={c.iso}
              value={c.code}
              style={{
                background: "var(--bg-base)",
                color: "var(--text-primary)",
              }}
            >
              {c.flag} {c.code}
            </option>
          ))}
        </select>
        <ChevronDown
          size={12}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "var(--text-disabled)" }}
        />
      </div>

      {/* Local number */}
      <div className="relative flex-1">
        <Phone
          size={15}
          className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "var(--text-disabled)" }}
        />
        <input
          type="tel"
          inputMode="numeric"
          placeholder="6XX XXX XXX"
          required
          value={number}
          onChange={(e) => onNumberChange(e.target.value.replace(/\D/g, ""))}
          className="w-full pl-11 pr-4 py-3.5 text-sm rounded-2xl transition-all duration-200"
          style={inputStyle}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<RegisterMode>("email");
  const [step, setStep] = useState<"form" | "otp">("form");

  // Shared fields
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Email mode
  const [email, setEmail] = useState("");

  // Phone mode
  const [countryCode, setCountryCode] = useState("+237");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneChannel, setPhoneChannel] = useState<"sms" | "whatsapp">("sms");

  useEffect(() => {
    if (mode !== "phone") return;
    const mappedCountry = COUNTRY_BY_CODE[countryCode];
    if (mappedCountry && country !== mappedCountry) {
      setCountry(mappedCountry);
    }
  }, [mode, countryCode, country]);

  function handleCountryCodeChange(value: string) {
    setCountryCode(value);
    const mappedCountry = COUNTRY_BY_CODE[value];
    if (mappedCountry) {
      setCountry(mappedCountry);
    }
  }

  function handleCountryChange(value: string) {
    setCountry(value);
    const mappedCode = COUNTRY_CODE_BY_COUNTRY[value];
    if (mappedCode) {
      setCountryCode(mappedCode);
    }
  }

  // OTP
  const [otp, setOtp] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  // UI
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const fullPhone = `${countryCode}${phoneNumber}`;

  function handleModeChange(m: RegisterMode) {
    setMode(m);
    setStep("form");
    setOtp("");
    setError("");
  }

  function destination() {
    return mode === "email" ? email : fullPhone;
  }

  const inputStyle: React.CSSProperties = {
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

  function validate(): string | null {
    const nv = validateName(name);
    if (!nv.isValid) return nv.error ?? "Invalid name";
    if (mode === "email") {
      const ev = validateEmail(email);
      if (!ev.isValid) return ev.error ?? "Invalid email";
    } else {
      if (!country) return "Please select your country.";
      if (!COUNTRY_CODE_BY_COUNTRY[country])
        return "Phone registration only supports the selected country and code.";
      if (!phoneNumber) return "Please enter your phone number.";
      if (!/^\d{6,12}$/.test(phoneNumber))
        return "Phone number must be 6–12 digits.";
    }
    if (password.length < 8) return "Password must be at least 8 characters.";
    return null;
  }

  async function sendOtp(): Promise<boolean> {
    const payload =
      mode === "email"
        ? { name, email, password, country, role: ["USER"], channel: "email" }
        : {
            name,
            email: fullPhone,
            phone: fullPhone,
            password,
            country,
            role: ["USER"],
            channel: phoneChannel,
          };

    const res = await fetch("/api/auth/send-registration-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to send OTP.");
      return false;
    }
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (step === "form") {
      const err = validate();
      if (err) {
        setError(err);
        return;
      }
      setLoading(true);
      try {
        const ok = await sendOtp();
        if (ok) setStep("otp");
      } catch {
        setError("Network error. Please check your connection.");
      }
      setLoading(false);
    } else {
      if (otp.length < 6) {
        setError("Please enter the full 6-digit code.");
        return;
      }
      setLoading(true);
      try {
        const res = await fetch("/api/auth/verify-registration-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: mode === "email" ? email : fullPhone,
            phone: mode === "phone" ? fullPhone : "",
            otp,
            channel: mode === "email" ? "email" : phoneChannel,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Invalid code.");
          setLoading(false);
          return;
        }
        await signIn("credentials", {
          email: mode === "email" ? email : fullPhone,
          password,
          redirect: false,
        });
        const callbackUrl = searchParams.get("callbackUrl");
        router.push(callbackUrl || "/dashboard");
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
      await sendOtp();
    } catch {
      setError("Network error.");
    }
    setResendLoading(false);
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
      <Suspense fallback={null}>
        <AffiliateRefCapture />
      </Suspense>

      {/* Left panel */}
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
        <div className="relative z-10" />
        <div className="relative z-10">
          <p className="text-4xl font-extrabold text-white leading-tight mb-6 tracking-tight">
            "Your Ambition Just
            <br />
            <span style={{ color: "rgba(255,255,255,0.55)" }}>
              Found Its Home Address."
            </span>
          </p>
          <p className="text-white/50 text-sm font-light leading-relaxed max-w-sm">
            Counseling, jobs, community, and commerce — all in one place
            built for Africa and the world.
          </p>
        </div>
        <div className="relative z-10 flex flex-col gap-3">
          {[
            "Free to join — no hidden fees",
            "Book counselors in under 2 minutes",
            "Browse 500+ job listings",
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

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="mb-8">
            <h1
              className="text-3xl font-extrabold mb-2 tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {step === "form"
                ? "Create your account."
                : "Verify your identity"}
            </h1>
            <p
              className="text-sm font-light"
              style={{ color: "var(--text-muted)" }}
            >
              {step === "form" ? (
                <>
                  Already have one?{" "}
                  <Link
                    href={`/login${searchParams.get("callbackUrl") ? `?callbackUrl=${encodeURIComponent(searchParams.get("callbackUrl")!)}` : ""}`}
                    className="font-semibold"
                    style={{ color: "var(--accent-primary)" }}
                  >
                    Sign in
                  </Link>
                </>
              ) : (
                <>
                  We&apos;ve sent a 6-digit code to{" "}
                  <span
                    className="font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {destination()}
                  </span>
                </>
              )}
            </p>
          </div>

          {/* Google + divider + mode toggle — form step only */}
          {step === "form" && (
            <>
              <button
                onClick={handleGoogle}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 hover:scale-[1.01] mb-5 disabled:opacity-60"
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

              <div className="flex items-center gap-3 mb-5">
                <div
                  className="flex-1 h-px"
                  style={{ background: "var(--divider)" }}
                />
                <span
                  className="text-xs font-medium"
                  style={{ color: "var(--text-disabled)" }}
                >
                  or register manually
                </span>
                <div
                  className="flex-1 h-px"
                  style={{ background: "var(--divider)" }}
                />
              </div>

              <ModeToggle mode={mode} onChange={handleModeChange} />
            </>
          )}

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
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
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <AnimatePresence mode="wait">
              {step === "form" ? (
                <motion.div
                  key={`form-${mode}`}
                  initial={{ opacity: 0, x: mode === "email" ? -12 : 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-4"
                >
                  {/* Name */}
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
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 text-sm rounded-2xl transition-all duration-200"
                      style={inputStyle}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                  </div>

                  {/* Email — email mode */}
                  {mode === "email" && (
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 text-sm rounded-2xl transition-all duration-200"
                        style={inputStyle}
                        onFocus={onFocus}
                        onBlur={onBlur}
                      />
                    </div>
                  )}

                  {/* Phone — phone mode */}
                  {mode === "phone" && (
                    <div className="flex flex-col gap-1.5">
                      <PhoneInput
                        countryCode={countryCode}
                        number={phoneNumber}
                        onCountryChange={handleCountryCodeChange}
                        onNumberChange={setPhoneNumber}
                        inputStyle={inputStyle}
                        onFocus={onFocus}
                        onBlur={onBlur}
                      />
                      {phoneNumber && (
                        <p
                          className="text-[11px] pl-1"
                          style={{ color: "var(--text-disabled)" }}
                        >
                          Full number:{" "}
                          <span
                            className="font-mono"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {fullPhone}
                          </span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Country */}
                  <div className="relative">
                    <Globe
                      size={15}
                      className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10"
                      style={{ color: "var(--text-disabled)" }}
                    />
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 text-sm rounded-2xl transition-all duration-200 appearance-none cursor-pointer"
                      style={{
                        ...inputStyle,
                        color: country
                          ? "var(--text-primary)"
                          : "var(--text-disabled)",
                      }}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    >
                      <option value="" disabled>
                        Select your country
                      </option>
                      {(mode === "phone"
                        ? COUNTRY_CODES.map((c) => c.country)
                        : COUNTRIES
                      ).map((c) => (
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

                  {/* Password */}
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
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                    <PasswordStrength password={password} />
                  </div>

                  {mode === "phone" && (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        {(["sms", "whatsapp"] as const).map((ch) => (
                          <button
                            key={ch}
                            type="button"
                            onClick={() => setPhoneChannel(ch)}
                            className="rounded-2xl py-2 text-sm font-semibold transition-all duration-200"
                            style={{
                              border: "1px solid var(--input-border)",
                              background:
                                phoneChannel === ch
                                  ? "linear-gradient(135deg, var(--scarlet), var(--purple))"
                                  : "var(--input-bg)",
                              color:
                                phoneChannel === ch
                                  ? "#fff"
                                  : "var(--text-primary)",
                            }}
                          >
                            {ch === "sms" ? "SMS" : "WhatsApp"}
                          </button>
                        ))}
                      </div>
                      <p
                        className="text-[11px] leading-relaxed px-1"
                        style={{ color: "var(--text-disabled)" }}
                      >
                        A 6-digit verification code will be sent to your phone
                        via {phoneChannel === "sms" ? "SMS" : "WhatsApp"}.
                      </p>
                    </>
                  )}
                </motion.div>
              ) : (
                /* OTP step */
                <motion.div
                  key="otp-step"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.22 }}
                  className="flex flex-col gap-3"
                >
                  {/* Badge */}
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium w-fit"
                    style={{
                      background: "var(--glass-bg)",
                      border: "1px solid var(--glass-border)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {mode === "email" ? (
                      <Mail size={12} />
                    ) : (
                      <Phone size={12} />
                    )}
                    {mode === "email"
                      ? `Email → ${email}`
                      : `${phoneChannel === "sms" ? "SMS" : "WhatsApp"} → ${fullPhone}`}
                  </div>

                  {/* OTP input */}
                  <div className="relative">
                    <Lock
                      size={15}
                      className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: "var(--text-disabled)" }}
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="_ _ _ _ _ _"
                      required
                      autoFocus
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      className="w-full pl-11 pr-4 py-4 text-sm rounded-2xl transition-all duration-200 text-center font-mono text-2xl tracking-[0.5em]"
                      style={inputStyle}
                      onFocus={onFocus}
                      onBlur={onBlur}
                      maxLength={6}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resendLoading}
                      className="text-xs font-medium"
                      style={{ color: "var(--accent-primary)" }}
                    >
                      {resendLoading ? "Sending…" : "Resend code"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStep("form");
                        setOtp("");
                        setError("");
                      }}
                      className="text-xs font-medium"
                      style={{ color: "var(--text-muted)" }}
                    >
                      ← Change method
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white text-sm font-bold transition-all duration-200 hover:scale-[1.01] hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 mt-1"
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
                    : "Verify & Create Account"}
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

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: "var(--bg-base)" }} />}>
      <RegisterPageContent />
    </Suspense>
  );
}
