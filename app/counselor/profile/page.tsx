"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Loader2,
  Save,
  User,
  Star,
  CheckCircle,
  ShieldCheck,
} from "lucide-react";

interface CounselorProfile {
  id: string;
  bio: string | null;
  specialty: string;
  rating: number;
  reviews: number;
  pricePerHour: number;
  available: boolean;
  verified: boolean;
  user: {
    name: string | null;
    email: string;
    image: string | null;
  };
}

const SPECIALTIES = [
  "RELATIONSHIP",
  "EMOTIONAL_WELLNESS",
  "LIFE_COACH",
  "FAMILY",
  "CAREER",
  "MENTAL_HEALTH",
];

export default function CounselorProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<CounselorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [bio, setBio] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [pricePerHour, setPricePerHour] = useState(0);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/counselors?me=true");
      const json = await res.json();
      if (json.success && json.data) {
        setProfile(json.data);
        setBio(json.data.bio || "");
        setSpecialty(json.data.specialty);
        setPricePerHour(json.data.pricePerHour);
        setAvailable(json.data.available);
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/counselors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio, specialty, pricePerHour, available }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2
          className="w-8 h-8 animate-spin"
          style={{ color: "var(--purple)" }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1
          className="text-3xl font-extrabold"
          style={{ color: "var(--text-primary)" }}
        >
          Edit Profile
        </h1>
        <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
          Update your counselor information visible to clients.
        </p>
      </div>

      {saved && (
        <div
          className="p-4 rounded-xl text-sm font-medium flex items-center gap-2"
          style={{
            background: "var(--success-bg)",
            color: "var(--success-text)",
            border: "1px solid var(--success-border)",
          }}
        >
          <CheckCircle className="w-4 h-4" /> Profile updated successfully!
        </div>
      )}

      {/* Profile header */}
      {profile && (
        <div
          className="p-5 rounded-2xl flex items-center gap-4"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          {profile.user.image ? (
            <img
              src={profile.user.image}
              alt={profile.user.name || ""}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "var(--glass-bg-subtle)" }}
            >
              <User
                className="w-8 h-8"
                style={{ color: "var(--text-muted)" }}
              />
            </div>
          )}
          <div>
            <p
              className="text-lg font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {profile.user.name}
            </p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {profile.user.email}
            </p>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-xs">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {profile.rating.toFixed(1)} ({profile.reviews} reviews)
              </span>
              {profile.verified && (
                <span
                  className="flex items-center gap-1 text-xs font-semibold"
                  style={{ color: "var(--success-text)" }}
                >
                  <ShieldCheck className="w-3 h-3" /> Verified
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div
        className="p-6 rounded-2xl space-y-5"
        style={{
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
        }}
      >
        {/* Specialty */}
        <div>
          <label
            className="block text-sm font-semibold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Specialty
          </label>
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="w-full p-3 rounded-xl glass-input text-sm"
          >
            {SPECIALTIES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        {/* Bio */}
        <div>
          <label
            className="block text-sm font-semibold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={5}
            placeholder="Tell clients about yourself, your experience, and approach..."
            className="w-full p-3 rounded-xl glass-input text-sm resize-none"
          />
        </div>

        {/* Price per hour */}
        <div>
          <label
            className="block text-sm font-semibold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Price per Hour (XAF)
          </label>
          <input
            type="number"
            value={pricePerHour}
            onChange={(e) => setPricePerHour(parseInt(e.target.value) || 0)}
            className="w-full p-3 rounded-xl glass-input text-sm"
            min={0}
          />
        </div>

        {/* Availability toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Available for Bookings
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Toggle off to pause new bookings
            </p>
          </div>
          <button
            onClick={() => setAvailable(!available)}
            className="w-12 h-7 rounded-full transition-all duration-300 relative"
            style={{
              background: available
                ? "linear-gradient(135deg, var(--purple), var(--blue))"
                : "var(--glass-bg-subtle)",
              border: available ? "none" : "1px solid var(--glass-border)",
            }}
          >
            <span
              className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300"
              style={{ left: available ? "calc(100% - 1.625rem)" : "0.125rem" }}
            />
          </button>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-70"
          style={{
            background: "linear-gradient(135deg, var(--purple), var(--blue))",
            boxShadow: "0 4px 16px rgba(123,47,190,0.4)",
          }}
        >
          {saving ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Profile
            </>
          )}
        </button>
      </div>
    </div>
  );
}
