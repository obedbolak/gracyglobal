"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import {
  CheckCircle,
  Video,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Star,
  Shield,
  Clock,
  CreditCard,
  Calendar,
  FileText,
  ArrowRight,
  Check,
} from "lucide-react";
import { getCounselorById, type Counselor } from "@/data/counselors";
import { useCurrency } from "@/hooks/useCurrency";

// ─── Time slots ───────────────────────────────────────────────────────────────
const TIME_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

// ─── Generate next 14 days ────────────────────────────────────────────────────
function getAvailableDates() {
  const dates = [];
  const today = new Date();
  for (let i = 1; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (d.getDay() !== 0) dates.push(d);
  }
  return dates;
}

const DATES = getAvailableDates();

const STEPS = [
  { id: 1, label: "Session Type", icon: Video },
  { id: 2, label: "Date & Time", icon: Calendar },
  { id: 3, label: "Your Note", icon: FileText },
  { id: 4, label: "Confirm", icon: CreditCard },
];

const SESSION_TYPES = [
  {
    id: "VIDEO",
    icon: Video,
    label: "Video Session",
    desc: "Face-to-face via secure video call. Recommended for deeper conversations.",
    duration: "60 min",
  },
  {
    id: "TEXT",
    icon: MessageCircle,
    label: "Text Session",
    desc: "Chat-based session. Great if you prefer writing over speaking.",
    duration: "60 min",
  },
];

function formatDate(d: Date) {
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

// ─── Step components ──────────────────────────────────────────────────────────

function StepSessionType({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h3
        className="text-lg font-extrabold mb-1"
        style={{ color: "var(--text-primary)" }}
      >
        How would you like to connect?
      </h3>
      <p
        className="text-sm font-light mb-4"
        style={{ color: "var(--text-muted)" }}
      >
        Both options are fully private and encrypted.
      </p>
      {SESSION_TYPES.map(({ id, icon: Icon, label, desc, duration }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className="flex items-start gap-4 p-5 rounded-2xl text-left transition-all duration-200 hover:scale-[1.01]"
          style={{
            background:
              value === id ? "var(--glass-bg-strong)" : "var(--glass-bg)",
            border:
              value === id
                ? "2px solid var(--purple-light)"
                : "1px solid var(--glass-border)",
            boxShadow:
              value === id ? "var(--glass-shadow-lg)" : "var(--glass-shadow)",
          }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background:
                value === id
                  ? "linear-gradient(135deg, var(--purple), var(--blue))"
                  : "var(--glass-bg-subtle)",
              border: "1px solid var(--glass-border)",
            }}
          >
            <Icon
              size={20}
              style={{ color: value === id ? "#fff" : "var(--text-muted)" }}
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span
                className="font-bold text-sm"
                style={{ color: "var(--text-primary)" }}
              >
                {label}
              </span>
              <span
                className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: "var(--badge-neutral-bg)",
                  color: "var(--text-muted)",
                }}
              >
                {duration}
              </span>
            </div>
            <p
              className="text-xs font-light leading-relaxed"
              style={{ color: "var(--text-muted)" }}
            >
              {desc}
            </p>
          </div>
          {value === id && (
            <Check
              size={16}
              className="flex-shrink-0 mt-1"
              style={{ color: "var(--purple-light)" }}
            />
          )}
        </button>
      ))}
    </div>
  );
}

function StepDateTime({
  date,
  time,
  onDate,
  onTime,
}: {
  date: Date | null;
  time: string;
  onDate: (d: Date) => void;
  onTime: (t: string) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3
          className="text-lg font-extrabold mb-1"
          style={{ color: "var(--text-primary)" }}
        >
          Pick a Date
        </h3>
        <p
          className="text-sm font-light mb-4"
          style={{ color: "var(--text-muted)" }}
        >
          Availability shown for the next 14 days.
        </p>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {DATES.map((d, i) => {
            const selected = date?.toDateString() === d.toDateString();
            return (
              <button
                key={i}
                onClick={() => onDate(d)}
                className="flex flex-col items-center py-3 px-1 rounded-xl transition-all duration-200 hover:scale-105"
                style={{
                  background: selected
                    ? "linear-gradient(135deg, var(--purple), var(--blue))"
                    : "var(--glass-bg)",
                  border: selected ? "none" : "1px solid var(--glass-border)",
                  boxShadow: selected
                    ? "0 4px 14px rgba(123,47,190,0.35)"
                    : "none",
                }}
              >
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider mb-1"
                  style={{
                    color: selected
                      ? "rgba(255,255,255,0.7)"
                      : "var(--text-muted)",
                  }}
                >
                  {d.toLocaleDateString("en-GB", { weekday: "short" })}
                </span>
                <span
                  className="text-lg font-extrabold"
                  style={{ color: selected ? "#fff" : "var(--text-primary)" }}
                >
                  {d.getDate()}
                </span>
                <span
                  className="text-[10px]"
                  style={{
                    color: selected
                      ? "rgba(255,255,255,0.6)"
                      : "var(--text-muted)",
                  }}
                >
                  {d.toLocaleDateString("en-GB", { month: "short" })}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <h3
          className="text-lg font-extrabold mb-1"
          style={{ color: "var(--text-primary)" }}
        >
          Pick a Time
        </h3>
        <p
          className="text-sm font-light mb-4"
          style={{ color: "var(--text-muted)" }}
        >
          All times shown in your local timezone.
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {TIME_SLOTS.map((t) => {
            const selected = time === t;
            return (
              <button
                key={t}
                onClick={() => onTime(t)}
                className="py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105"
                style={{
                  background: selected
                    ? "linear-gradient(135deg, var(--purple), var(--blue))"
                    : "var(--glass-bg)",
                  border: selected ? "none" : "1px solid var(--glass-border)",
                  color: selected ? "#fff" : "var(--text-secondary)",
                  boxShadow: selected
                    ? "0 4px 14px rgba(123,47,190,0.35)"
                    : "none",
                }}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StepNotes({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h3
        className="text-lg font-extrabold mb-1"
        style={{ color: "var(--text-primary)" }}
      >
        Anything you'd like your counselor to know?
      </h3>
      <p
        className="text-sm font-light mb-2"
        style={{ color: "var(--text-muted)" }}
      >
        This is optional but helps your counselor prepare for your session.
      </p>
      <textarea
        rows={6}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="E.g. I've been struggling with anxiety at work lately..."
        className="w-full p-4 text-sm resize-none leading-relaxed transition-all duration-200"
        style={{
          background: "var(--input-bg)",
          border: "1px solid var(--input-border)",
          borderRadius: "var(--card-radius)",
          color: "var(--text-primary)",
          outline: "none",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--input-border-focus)";
          e.currentTarget.style.boxShadow = "var(--input-shadow-focus)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--input-border)";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
      <div
        className="flex items-center gap-2 text-xs"
        style={{ color: "var(--text-muted)" }}
      >
        <Shield size={12} style={{ color: "var(--accent-primary)" }} />
        Your message is private and only shared with your counselor.
      </div>
    </div>
  );
}

function StepConfirm({
  sessionType,
  date,
  time,
  notes,
  counselor,
}: {
  sessionType: string;
  date: Date | null;
  time: string;
  notes: string;
  counselor: Counselor;
}) {
  const { convert, loading } = useCurrency();

  return (
    <div className="flex flex-col gap-5">
      <h3
        className="text-lg font-extrabold mb-1"
        style={{ color: "var(--text-primary)" }}
      >
        Review & Confirm
      </h3>
      {[
        { label: "Counselor", value: counselor.name },
        {
          label: "Session Type",
          value: sessionType === "VIDEO" ? "Video Session" : "Text Session",
        },
        { label: "Date", value: date ? formatDate(date) : "—" },
        { label: "Time", value: time || "—" },
        { label: "Duration", value: "60 minutes" },
      ].map(({ label, value }) => (
        <div
          key={label}
          className="flex items-center justify-between py-3 px-4 rounded-xl"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <span
            className="text-sm font-medium"
            style={{ color: "var(--text-muted)" }}
          >
            {label}
          </span>
          <span
            className="text-sm font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {value}
          </span>
        </div>
      ))}
      {notes && (
        <div
          className="p-4 rounded-xl"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <span
            className="text-xs font-semibold block mb-1"
            style={{ color: "var(--text-muted)" }}
          >
            Your Note
          </span>
          <p
            className="text-sm font-light leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            {notes}
          </p>
        </div>
      )}
      <div
        className="flex items-center justify-between p-5 rounded-2xl"
        style={{
          background:
            "linear-gradient(135deg, rgba(123,47,190,0.12), rgba(26,58,219,0.08))",
          border: "1px solid var(--glass-border)",
        }}
      >
        <div>
          <span
            className="text-sm font-medium block"
            style={{ color: "var(--text-muted)" }}
          >
            Total
          </span>
          <span
            className="text-xs font-light"
            style={{ color: "var(--text-muted)" }}
          >
            1 session × 60 min
          </span>
        </div>
        <span
          className="text-3xl font-extrabold"
          style={{
            background: "linear-gradient(135deg, var(--purple), var(--blue))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {loading ? "..." : convert(counselor.price)} /hr
        </span>
      </div>
      <div
        className="flex items-center gap-2 text-xs justify-center"
        style={{ color: "var(--text-muted)" }}
      >
        <Shield size={12} style={{ color: "var(--accent-primary)" }} />
        Secure payment · Free cancellation up to 24h before
      </div>
    </div>
  );
}

function SuccessScreen({
  counselor,
  date,
  time,
}: {
  counselor: Counselor;
  date: Date | null;
  time: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center text-center gap-6 py-8"
    >
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, var(--purple), var(--blue))",
          boxShadow: "0 8px 30px rgba(123,47,190,0.45)",
        }}
      >
        <CheckCircle size={36} className="text-white" />
      </div>
      <div>
        <h2
          className="text-2xl font-extrabold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          You're all booked!
        </h2>
        <p
          className="text-sm font-light leading-relaxed max-w-sm"
          style={{ color: "var(--text-muted)" }}
        >
          Your session with{" "}
          <strong style={{ color: "var(--text-primary)" }}>
            {counselor.name}
          </strong>{" "}
          is confirmed for{" "}
          <strong style={{ color: "var(--text-primary)" }}>
            {date ? formatDate(date) : ""} at {time}
          </strong>
          . Check your email for details.
        </p>
      </div>
      <div
        className="flex items-center gap-2 text-xs px-4 py-2 rounded-full"
        style={{
          background: "var(--success-bg)",
          color: "var(--success-text)",
          border: "1px solid var(--success-border)",
        }}
      >
        <Clock size={12} /> A reminder will be sent 1 hour before your session
      </div>
      <a
        href="/dashboard"
        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold text-white transition-all duration-200 hover:scale-105"
        style={{
          background: "linear-gradient(135deg, var(--purple), var(--blue))",
          boxShadow: "0 4px 16px rgba(123,47,190,0.4)",
        }}
      >
        Go to Dashboard <ArrowRight size={15} />
      </a>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function BookingPage() {
  const params = useParams();
  const router = useRouter();

  const id = Array.isArray(params.id) ? params.id[0] : (params.id as string);
  const counselor = getCounselorById(id);

  const [step, setStep] = useState(1);
  const [sessionType, setSessionType] = useState("VIDEO");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Counselor not found
  if (!counselor) {
    return (
      <main className="min-h-screen">
        <div className="max-w-lg mx-auto px-4 py-32 text-center">
          <p
            className="text-lg font-bold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Counselor not found.
          </p>
          <a
            href="/counselors"
            className="text-sm font-semibold"
            style={{ color: "var(--accent-primary)" }}
          >
            ← Browse all counselors
          </a>
        </div>
      </main>
    );
  }

  const canNext =
    (step === 1 && !!sessionType) ||
    (step === 2 && !!selectedDate && !!selectedTime) ||
    step === 3 ||
    step === 4;

  async function handleConfirm() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1400));
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        {!submitted && (
          <button
            onClick={() => (step > 1 ? setStep(step - 1) : router.back())}
            className="flex items-center gap-1.5 text-sm font-medium mb-8 transition-colors duration-200 hover:opacity-70"
            style={{ color: "var(--text-muted)" }}
          >
            <ChevronLeft size={16} /> {step > 1 ? "Back" : "All Counselors"}
          </button>
        )}

        {submitted ? (
          <div className="glass p-8 sm:p-12 max-w-lg mx-auto">
            <SuccessScreen
              counselor={counselor}
              date={selectedDate}
              time={selectedTime}
            />
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6 items-start">
            {/* LEFT sidebar */}
            <div className="flex flex-col gap-5">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="glass p-5"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative flex-shrink-0">
                    <img
                      src={counselor.img}
                      alt={counselor.name}
                      className="w-16 h-16 rounded-2xl object-cover"
                    />
                    {counselor.available && (
                      <span
                        className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2"
                        style={{
                          background: "#4ade80",
                          borderColor: "var(--card-bg)",
                        }}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span
                        className="font-extrabold text-sm"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {counselor.name}
                      </span>
                      {counselor.verified && (
                        <CheckCircle
                          size={13}
                          style={{ color: "var(--blue-light)" }}
                        />
                      )}
                    </div>
                    <p
                      className="text-xs mb-2"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {counselor.role}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Star
                        size={12}
                        className="fill-yellow-400 text-yellow-400"
                      />
                      <span
                        className="text-xs font-bold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {counselor.rating}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        ({counselor.reviews} reviews)
                      </span>
                    </div>
                  </div>
                </div>
                <p
                  className="text-xs leading-relaxed font-light mb-4"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {counselor.bio}
                </p>
                <div
                  className="flex items-center justify-between pt-3"
                  style={{ borderTop: "1px solid var(--divider)" }}
                >
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Per session
                  </span>
                  <span
                    className="text-base font-extrabold"
                    style={{ color: "var(--accent-primary)" }}
                  >
                    CFA {counselor.price.toLocaleString()}
                  </span>
                </div>
              </motion.div>

              {/* Step tracker */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="glass p-5"
              >
                <p
                  className="text-xs font-semibold uppercase tracking-widest mb-4"
                  style={{ color: "var(--text-muted)" }}
                >
                  Your Progress
                </p>
                <div className="flex flex-col gap-3">
                  {STEPS.map(({ id, label, icon: Icon }) => {
                    const done = step > id;
                    const active = step === id;
                    return (
                      <div key={id} className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
                          style={{
                            background: done
                              ? "linear-gradient(135deg, var(--purple), var(--blue))"
                              : active
                                ? "var(--glass-bg-strong)"
                                : "var(--glass-bg-subtle)",
                            border: active
                              ? "2px solid var(--purple-light)"
                              : "1px solid var(--glass-border)",
                            boxShadow: done
                              ? "0 4px 12px rgba(123,47,190,0.3)"
                              : "none",
                          }}
                        >
                          {done ? (
                            <Check
                              size={13}
                              className="text-white"
                              strokeWidth={3}
                            />
                          ) : (
                            <Icon
                              size={13}
                              style={{
                                color: active
                                  ? "var(--accent-primary)"
                                  : "var(--text-disabled)",
                              }}
                            />
                          )}
                        </div>
                        <span
                          className="text-sm font-semibold"
                          style={{
                            color: active
                              ? "var(--text-primary)"
                              : done
                                ? "var(--text-secondary)"
                                : "var(--text-disabled)",
                          }}
                        >
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Trust badges */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="glass p-4 flex flex-col gap-2.5"
              >
                {[
                  { icon: Shield, text: "100% private & confidential" },
                  { icon: Clock, text: "Free cancellation up to 24h before" },
                  { icon: Star, text: "4.8★ average counselor rating" },
                ].map(({ icon: Icon, text }, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <Icon
                      size={13}
                      style={{ color: "var(--accent-primary)", flexShrink: 0 }}
                    />
                    {text}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* RIGHT form */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="glass p-6 sm:p-8"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p
                      className="text-xs font-semibold uppercase tracking-widest mb-1"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Step {step} of {STEPS.length}
                    </p>
                    <h2
                      className="text-xl font-extrabold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {STEPS[step - 1].label}
                    </h2>
                  </div>
                  <div
                    className="w-24 h-2 rounded-full overflow-hidden"
                    style={{ background: "var(--glass-bg-subtle)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(step / STEPS.length) * 100}%`,
                        background:
                          "linear-gradient(90deg, var(--purple), var(--blue))",
                      }}
                    />
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                  >
                    {step === 1 && (
                      <StepSessionType
                        value={sessionType}
                        onChange={setSessionType}
                      />
                    )}
                    {step === 2 && (
                      <StepDateTime
                        date={selectedDate}
                        time={selectedTime}
                        onDate={setSelectedDate}
                        onTime={setSelectedTime}
                      />
                    )}
                    {step === 3 && (
                      <StepNotes value={notes} onChange={setNotes} />
                    )}
                    {step === 4 && (
                      <StepConfirm
                        sessionType={sessionType}
                        date={selectedDate}
                        time={selectedTime}
                        notes={notes}
                        counselor={counselor}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>

                <div
                  className="flex items-center justify-between mt-10 pt-6"
                  style={{ borderTop: "1px solid var(--divider)" }}
                >
                  <button
                    onClick={() => setStep((s) => Math.max(1, s - 1))}
                    disabled={step === 1}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-30"
                    style={{
                      background: "var(--glass-bg)",
                      border: "1px solid var(--glass-border)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <ChevronLeft size={15} /> Back
                  </button>

                  {step < 4 ? (
                    <button
                      onClick={() => setStep((s) => s + 1)}
                      disabled={!canNext}
                      className="flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--purple), var(--blue))",
                        boxShadow: "0 4px 16px rgba(123,47,190,0.4)",
                      }}
                    >
                      Continue <ChevronRight size={15} />
                    </button>
                  ) : (
                    <button
                      onClick={handleConfirm}
                      disabled={loading}
                      className="flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-105 disabled:opacity-70"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--scarlet), var(--purple))",
                        boxShadow: "0 4px 16px rgba(220,20,60,0.4)",
                      }}
                    >
                      {loading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                          Processing...
                        </>
                      ) : (
                        <>
                          Confirm Booking <Check size={15} />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
