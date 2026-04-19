"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import ImageUpload from "@/components/shared/ImageUpload";
import {
  ArrowLeft,
  Save,
  Loader2,
  BookOpen,
  Users,
  Layers,
  BarChart,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle,
} from "lucide-react";

const CATEGORIES = [
  "Spiritual Development",
  "Healing & Wellness",
  "Meditation",
  "Energy Work",
  "Personal Growth",
  "Mindfulness",
  "Life Coaching",
  "Relationships",
  "Business",
  "Technology",
  "Finance",
  "Marketing",
  "Design",
  "Other",
];

const LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

interface CourseData {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  category: string;
  level: string;
  price: number;
  isFree: boolean;
  published: boolean;
  featured: boolean;
  _count: { enrollments: number; sections: number };
  totalLessons: number;
}

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const courseId = params.id as string;

  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [price, setPrice] = useState(0);
  const [isFree, setIsFree] = useState(true);
  const [featured, setFeatured] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}`);
      const json = await res.json();

      if (json.course) {
        const c = json.course;
        setCourse(c);
        setTitle(c.title);
        setDescription(c.description);
        setThumbnail(c.thumbnail || "");
        setCategory(c.category);
        setLevel(c.level);
        setPrice(c.price);
        setIsFree(c.isFree);
        setFeatured(c.featured);
      }
    } catch (err) {
      setError("Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          thumbnail: thumbnail || null,
          category,
          level,
          price: isFree ? 0 : price,
          isFree,
          featured,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update course");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message);
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

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center glass p-8 rounded-2xl">
          <p style={{ color: "var(--error-text)" }}>Course not found</p>
          <Link
            href="/teacher/courses"
            className="text-sm mt-4 inline-block"
            style={{ color: "var(--text-link)" }}
          >
            ← Back to courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/teacher/courses"
            className="flex items-center gap-1.5 text-sm mb-3 transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to courses
          </Link>
          <h1
            className="text-2xl font-extrabold"
            style={{ color: "var(--text-primary)" }}
          >
            Edit Course
          </h1>
        </div>

        {/* Quick stats + actions */}
        <div className="flex items-center gap-3">
          <div
            className="px-4 py-2 rounded-xl text-center"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
            }}
          >
            <div
              className="flex items-center gap-1.5 text-xs mb-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              <Users className="w-3 h-3" />
              Enrolled
            </div>
            <p
              className="text-lg font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {course._count.enrollments}
            </p>
          </div>
          <div
            className="px-4 py-2 rounded-xl text-center"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
            }}
          >
            <div
              className="flex items-center gap-1.5 text-xs mb-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              <BookOpen className="w-3 h-3" />
              Lessons
            </div>
            <p
              className="text-lg font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {course.totalLessons}
            </p>
          </div>
        </div>
      </div>

      {/* Quick navigation */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link
          href={`/teacher/courses/${courseId}/sections`}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105"
          style={{
            background: "var(--info-bg)",
            color: "var(--info-text)",
            border: "1px solid var(--info-border)",
          }}
        >
          <Layers className="w-3.5 h-3.5" />
          Manage Content
        </Link>
        <Link
          href={`/teacher/courses/${courseId}/students`}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105"
          style={{
            background: "var(--badge-purple-bg)",
            color: "var(--badge-purple-text)",
            border: "1px solid rgba(123,47,190,0.2)",
          }}
        >
          <Users className="w-3.5 h-3.5" />
          Students
        </Link>
        <Link
          href={`/teacher/courses/${courseId}/analytics`}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105"
          style={{
            background: "var(--success-bg)",
            color: "var(--success-text)",
            border: "1px solid var(--success-border)",
          }}
        >
          <BarChart className="w-3.5 h-3.5" />
          Analytics
        </Link>
      </div>

      {/* Messages */}
      {saved && (
        <div
          className="p-4 rounded-xl flex items-center gap-2 text-sm font-medium"
          style={{
            background: "var(--success-bg)",
            color: "var(--success-text)",
            border: "1px solid var(--success-border)",
          }}
        >
          <CheckCircle className="w-4 h-4" /> Course updated successfully!
        </div>
      )}

      {error && (
        <div
          className="p-4 rounded-xl text-sm"
          style={{
            background: "var(--error-bg)",
            color: "var(--error-text)",
            border: "1px solid var(--error-border)",
          }}
        >
          {error}
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
        {/* Thumbnail */}
        <div>
          <ImageUpload
            folder="courses"
            label="Course Thumbnail"
            aspectRatio="video"
            currentImage={thumbnail || undefined}
            onUploadComplete={(url) => setThumbnail(url)}
            onRemove={() => setThumbnail("")}
          />
        </div>

        {/* Title */}
        <div>
          <label
            className="block text-sm font-semibold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 rounded-xl glass-input text-sm"
          />
        </div>

        {/* Description */}
        <div>
          <label
            className="block text-sm font-semibold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full p-3 rounded-xl glass-input text-sm resize-none"
          />
        </div>

        {/* Category + Level */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 rounded-xl glass-input text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Level
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full p-3 rounded-xl glass-input text-sm"
            >
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pricing */}
        <div>
          <label
            className="block text-sm font-semibold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Pricing
          </label>
          <div className="flex items-center gap-3 mb-3">
            <button
              type="button"
              onClick={() => setIsFree(true)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: isFree
                  ? "linear-gradient(135deg, var(--purple), var(--blue))"
                  : "var(--glass-bg)",
                color: isFree ? "#fff" : "var(--text-secondary)",
                border: isFree ? "none" : "1px solid var(--glass-border)",
              }}
            >
              Free
            </button>
            <button
              type="button"
              onClick={() => setIsFree(false)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: !isFree
                  ? "linear-gradient(135deg, var(--purple), var(--blue))"
                  : "var(--glass-bg)",
                color: !isFree ? "#fff" : "var(--text-secondary)",
                border: !isFree ? "none" : "1px solid var(--glass-border)",
              }}
            >
              Paid
            </button>
          </div>
          {!isFree && (
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
              min={0}
              placeholder="Price in XAF"
              className="w-full p-3 rounded-xl glass-input text-sm"
            />
          )}
        </div>

        {/* Toggles */}
        <div className="space-y-4">
          {/* Featured */}
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Featured
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Show prominently on the courses page
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFeatured(!featured)}
              className="w-12 h-7 rounded-full transition-all duration-300 relative"
              style={{
                background: featured
                  ? "linear-gradient(135deg, var(--purple), var(--blue))"
                  : "var(--glass-bg-subtle)",
                border: featured ? "none" : "1px solid var(--glass-border)",
              }}
            >
              <span
                className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300"
                style={{
                  left: featured ? "calc(100% - 1.625rem)" : "0.125rem",
                }}
              />
            </button>
          </div>
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
              <Loader2 className="w-4 h-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}
