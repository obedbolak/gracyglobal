"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ImageUpload from "@/components/shared/ImageUpload";
import { useCategories } from "@/hooks/useCategories";
import {
  ArrowLeft,
  Save,
  Loader2,
  BookOpen,
  Users,
  Layers,
  BarChart,
  CheckCircle,
} from "lucide-react";

const LEVELS = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
];

interface CourseData {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  categoryId: string; // ← was: category: string
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
  const courseId = params.id as string;

  const { categories, loading: categoriesLoading } = useCategories("course");

  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [categoryId, setCategoryId] = useState(""); // ← was: category
  const [level, setLevel] = useState("");
  const [price, setPrice] = useState(0);
  const [isFree, setIsFree] = useState(true);
  const [featured, setFeatured] = useState(false);

  const fetchCourse = useCallback(async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}`);
      const json = await res.json();

      if (json.course) {
        const c = json.course;
        setCourse(c);
        setTitle(c.title);
        setDescription(c.description);
        setThumbnail(c.thumbnail || "");
        setCategoryId(c.categoryId || ""); // ← was: setCategory(c.category)
        setLevel(c.level);
        setPrice(c.price);
        setIsFree(c.isFree);
        setFeatured(c.featured);
      }
    } catch {
      setError("Failed to load course");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    void fetchCourse();
  }, [fetchCourse]);

  const handleSave = async () => {
    if (!categoryId) {
      setError("Please select a category");
      return;
    }

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
          categoryId, // ← was: category
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
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to update course";
      setError(message);
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

        {/* Quick stats */}
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
      <div className="space-y-6">
        <div
          className="p-6 rounded-2xl"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <ImageUpload
            folder="courses"
            label="Course Thumbnail"
            aspectRatio="video"
            currentImage={thumbnail || undefined}
            onUploadComplete={(url) => setThumbnail(url)}
            onRemove={() => setThumbnail("")}
          />
          <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
            Recommended size: 1280x720 pixels (16:9 aspect ratio)
          </p>
        </div>

        <div
          className="p-6 rounded-2xl space-y-5"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <h3
            className="text-lg font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Course Information
          </h3>

          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Title <span style={{ color: "var(--scarlet)" }}>*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Introduction to Meditation"
              className="w-full p-3 rounded-xl glass-input text-sm"
            />
          </div>

          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Description <span style={{ color: "var(--scarlet)" }}>*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what students will learn..."
              rows={5}
              className="w-full p-3 rounded-xl glass-input text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={categoriesLoading}
                className="w-full p-3 rounded-xl glass-input text-sm"
              >
                <option value="">
                  {categoriesLoading ? "Loading..." : "Select a category"}
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
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
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div
          className="p-6 rounded-2xl space-y-4"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <h3
            className="text-lg font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Pricing
          </h3>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsFree(true)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: isFree
                  ? "linear-gradient(135deg, var(--purple), var(--blue))"
                  : "var(--glass-bg)",
                color: isFree ? "#fff" : "var(--text-secondary)",
                border: isFree ? "none" : "1px solid var(--glass-border)",
                boxShadow: isFree
                  ? "0 4px 12px rgba(123,47,190,0.3)"
                  : "none",
              }}
            >
              Free Course
            </button>
            <button
              type="button"
              onClick={() => setIsFree(false)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: !isFree
                  ? "linear-gradient(135deg, var(--purple), var(--blue))"
                  : "var(--glass-bg)",
                color: !isFree ? "#fff" : "var(--text-secondary)",
                border: !isFree ? "none" : "1px solid var(--glass-border)",
                boxShadow: !isFree
                  ? "0 4px 12px rgba(123,47,190,0.3)"
                  : "none",
              }}
            >
              Paid Course
            </button>
          </div>

          {!isFree && (
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Price (XAF)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                min={0}
                placeholder="5000"
                className="w-full p-3 rounded-xl glass-input text-sm"
              />
            </div>
          )}
        </div>

        <div
          className="p-6 rounded-2xl space-y-4"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <h3
            className="text-lg font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Settings
          </h3>

          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setFeatured(!featured)}
              className="relative w-10 h-6 rounded-full transition-colors"
              style={{
                background: featured
                  ? "linear-gradient(135deg, var(--purple), var(--blue))"
                  : "var(--glass-bg-strong)",
                border: featured ? "none" : "1px solid var(--glass-border)",
              }}
            >
              <span
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
                style={{
                  left: featured ? "calc(100% - 1.375rem)" : "0.125rem",
                }}
              />
            </div>
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Featured Course
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Display prominently on the courses page
              </p>
            </div>
          </label>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !categoryId}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-70 disabled:hover:scale-100"
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
