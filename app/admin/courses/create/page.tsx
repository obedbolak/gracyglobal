// app/admin/courses/create/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/shared/ImageUpload";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { CourseLevel } from "@prisma/client";

const courseLevels: CourseLevel[] = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

const categories = [
  "Spiritual Development",
  "Healing & Wellness",
  "Meditation",
  "Energy Work",
  "Personal Growth",
  "Mindfulness",
  "Life Coaching",
  "Relationships",
  "Other",
];

export default function CreateCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    level: "BEGINNER" as CourseLevel,
    price: "",
    isFree: false,
    published: false,
    featured: false,
  });
  const [thumbnail, setThumbnail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          thumbnail,
          category: formData.category,
          level: formData.level,
          price: formData.isFree ? 0 : parseInt(formData.price),
          isFree: formData.isFree,
          published: formData.published,
          featured: formData.featured,
        }),
      });

      if (!response.ok) throw new Error("Failed to create course");

      const { course } = await response.json();

      // Redirect to edit page to add sections/lessons
      router.push(`/admin/courses/${course.id}/edit`);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/courses"
          className="p-2 hover:bg-[var(--glass-bg-hover)] rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Create Course
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Add a new e-learning course
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Course Thumbnail */}
        <div className="glass p-6 rounded-xl">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Course Thumbnail
          </h2>
          <ImageUpload
            folder="courses/thumbnails"
            aspectRatio="video"
            onUploadComplete={(url) => setThumbnail(url)}
          />
        </div>

        {/* Basic Info */}
        <div className="glass p-6 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Basic Information
          </h2>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Course Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="glass-input w-full px-4 py-3"
              placeholder="e.g., Introduction to Meditation"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Description *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={5}
              className="glass-input w-full px-4 py-3 resize-none"
              placeholder="Describe what students will learn..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="glass-input w-full px-4 py-3"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Level *
              </label>
              <select
                required
                value={formData.level}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    level: e.target.value as CourseLevel,
                  })
                }
                className="glass-input w-full px-4 py-3"
              >
                {courseLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="glass p-6 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Pricing
          </h2>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.isFree}
              onChange={(e) =>
                setFormData({ ...formData, isFree: e.target.checked })
              }
              className="w-5 h-5 rounded border-[var(--input-border)] text-[var(--purple)] focus:ring-[var(--purple)]"
            />
            <div>
              <span className="text-[var(--text-secondary)] font-medium">
                Free Course
              </span>
              <p className="text-xs text-[var(--text-muted)]">
                Make this course available for free
              </p>
            </div>
          </label>

          {!formData.isFree && (
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Price (XAF) *
              </label>
              <input
                type="number"
                required={!formData.isFree}
                min="0"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="glass-input w-full px-4 py-3"
                placeholder="0"
              />
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="glass p-6 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Settings
          </h2>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) =>
                setFormData({ ...formData, featured: e.target.checked })
              }
              className="w-5 h-5 rounded border-[var(--input-border)] text-[var(--purple)] focus:ring-[var(--purple)]"
            />
            <div>
              <span className="text-[var(--text-secondary)] font-medium">
                Featured Course
              </span>
              <p className="text-xs text-[var(--text-muted)]">
                Display prominently on courses page
              </p>
            </div>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) =>
                setFormData({ ...formData, published: e.target.checked })
              }
              className="w-5 h-5 rounded border-[var(--input-border)] text-[var(--purple)] focus:ring-[var(--purple)]"
            />
            <div>
              <span className="text-[var(--text-secondary)] font-medium">
                Publish Course
              </span>
              <p className="text-xs text-[var(--text-muted)]">
                Make this course visible to students
              </p>
            </div>
          </label>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || !thumbnail}
            className="btn-primary flex items-center gap-2 px-6 py-3 rounded-lg disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {loading ? "Creating..." : "Create Course"}
          </button>
          <Link
            href="/admin/courses"
            className="btn-secondary px-6 py-3 rounded-lg"
          >
            Cancel
          </Link>
        </div>

        {!thumbnail && (
          <p className="text-sm text-[var(--warning-text)]">
            ⚠️ Please upload a course thumbnail before creating
          </p>
        )}
      </form>
    </div>
  );
}
