"use client";

import { SetStateAction, useState } from "react";
import { useRouter } from "next/navigation";
import { Course, CourseSection, Lesson, CourseLevel } from "@prisma/client";
import {
  Save,
  Loader2,
  BookOpen,
  Image as ImageIcon,
  DollarSign,
  Tag,
  BarChart2,
  Globe,
  Star,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  GripVertical,
  Video,
  FileText,
  HelpCircle,
  Radio,
  Eye,
  EyeOff,
} from "lucide-react";
import ImageUpload from "@/components/shared/ImageUpload";

// ─── Types ────────────────────────────────────────────────────────────────────

type LessonWithQuiz = Lesson & { quiz?: { id: string } | null };
type SectionWithLessons = CourseSection & { lessons: LessonWithQuiz[] };
type CourseWithSections = Course & { sections: SectionWithLessons[] };

interface EditCourseFormProps {
  course: CourseWithSections;
}

const CATEGORIES = [
  "Business",
  "Technology",
  "Health & Wellness",
  "Personal Development",
  "Finance",
  "Marketing",
  "Design",
  "Language",
  "Parenting",
  "Career",
  "Other",
];

const LEVELS: { value: CourseLevel; label: string }[] = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
];

const LESSON_TYPE_ICONS: Record<string, React.ReactNode> = {
  VIDEO: <Video className="w-3.5 h-3.5" />,
  TEXT: <FileText className="w-3.5 h-3.5" />,
  QUIZ: <HelpCircle className="w-3.5 h-3.5" />,
  LIVE: <Radio className="w-3.5 h-3.5" />,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function EditCourseForm({ course }: EditCourseFormProps) {
  const router = useRouter();

  // Basic info state
  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description);
  const [thumbnail, setThumbnail] = useState(course.thumbnail || "");
  const [category, setCategory] = useState(course.category);
  const [level, setLevel] = useState<CourseLevel>(course.level);
  const [price, setPrice] = useState(course.price.toString());
  const [isFree, setIsFree] = useState(course.isFree);
  const [published, setPublished] = useState(course.published);
  const [featured, setFeatured] = useState(course.featured);

  // Sections state (read-only display — managed via dedicated section pages)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(),
  );

  // UI state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleIsFreeToggle = (checked: boolean) => {
    setIsFree(checked);
    if (checked) setPrice("0");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!title.trim()) return setError("Title is required.");
    if (!description.trim()) return setError("Description is required.");
    if (!category) return setError("Please select a category.");

    setSaving(true);
    try {
      const res = await fetch(`/api/courses/${course.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          thumbnail: thumbnail || null,
          category,
          level,
          price: isFree ? 0 : parseInt(price) || 0,
          isFree,
          published,
          featured,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update course");

      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* ── Status badges ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            published
              ? "bg-green-500/10 text-green-500"
              : "bg-[var(--text-muted)]/10 text-[var(--text-muted)]"
          }`}
        >
          {published ? "Published" : "Draft"}
        </span>
        {featured && (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--purple-faint)] text-[var(--purple)]">
            Featured
          </span>
        )}
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--glass-bg-strong)] text-[var(--text-secondary)]">
          {course.sections.length} sections ·{" "}
          {course.sections.reduce((acc, s) => acc + s.lessons.length, 0)}{" "}
          lessons
        </span>
      </div>

      {/* ── Error / Success ── */}
      {error && (
        <div className="glass p-4 rounded-xl border border-[var(--scarlet)]/30 text-[var(--scarlet)] text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="glass p-4 rounded-xl border border-green-500/30 text-green-500 text-sm">
          Course updated successfully!
        </div>
      )}

      {/* ── Section 1: Basic Info ── */}
      <div className="glass rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-4 h-4 text-[var(--purple)]" />
          <h2 className="font-semibold text-[var(--text-primary)]">
            Basic Information
          </h2>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--text-secondary)]">
            Course Title <span className="text-[var(--scarlet)]">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Financial Freedom for African Women"
            className="glass-input w-full px-4 py-2.5"
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--text-secondary)]">
            Description <span className="text-[var(--scarlet)]">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What will students learn? Who is this for?"
            rows={5}
            className="glass-input w-full px-4 py-2.5 resize-none"
            required
          />
        </div>

        {/* Category + Level */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--text-secondary)]">
              <Tag className="w-3.5 h-3.5 inline mr-1" />
              Category <span className="text-[var(--scarlet)]">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="glass-input w-full px-4 py-2.5"
              required
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--text-secondary)]">
              <BarChart2 className="w-3.5 h-3.5 inline mr-1" />
              Level
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as CourseLevel)}
              className="glass-input w-full px-4 py-2.5"
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

      {/* ── Section 2: Thumbnail ── */}
      <div className="glass rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <ImageIcon className="w-4 h-4 text-[var(--purple)]" />
          <h2 className="font-semibold text-[var(--text-primary)]">
            Thumbnail
          </h2>
        </div>

        <ImageUpload
          folder="courses"
          label="Upload Course Thumbnail"
          currentImage={thumbnail}
          aspectRatio="video"
          maxSize={5}
          onUploadComplete={(url) => setThumbnail(url)}
        />
        <p className="text-xs text-[var(--text-muted)]">
          Recommended size: 1280x720 pixels (16:9 aspect ratio)
        </p>
      </div>

      {/* ── Section 3: Pricing ── */}
      <div className="glass rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <DollarSign className="w-4 h-4 text-[var(--purple)]" />
          <h2 className="font-semibold text-[var(--text-primary)]">Pricing</h2>
        </div>

        {/* Free toggle */}
        <label className="flex items-center gap-3 cursor-pointer w-fit">
          <div
            onClick={() => handleIsFreeToggle(!isFree)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              isFree ? "bg-[var(--purple)]" : "bg-[var(--glass-bg-strong)]"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                isFree ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </div>
          <span className="text-sm font-medium text-[var(--text-secondary)]">
            Free course
          </span>
        </label>

        {/* Price input */}
        {!isFree && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--text-secondary)]">
              Price (XAF)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--text-muted)]">
                XAF
              </span>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min={0}
                className="glass-input w-full pl-12 pr-4 py-2.5"
                placeholder="0"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Section 4: Visibility ── */}
      <div className="glass rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Globe className="w-4 h-4 text-[var(--purple)]" />
          <h2 className="font-semibold text-[var(--text-primary)]">
            Visibility & Status
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Published */}
          <label className="glass p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-[var(--glass-bg-subtle)] transition-colors">
            <div className="flex items-center gap-3">
              {published ? (
                <Eye className="w-4 h-4 text-green-500" />
              ) : (
                <EyeOff className="w-4 h-4 text-[var(--text-muted)]" />
              )}
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  Published
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  Visible to students
                </p>
              </div>
            </div>
            <div
              onClick={() => setPublished(!published)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                published ? "bg-green-500" : "bg-[var(--glass-bg-strong)]"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  published ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </div>
          </label>

          {/* Featured */}
          <label className="glass p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-[var(--glass-bg-subtle)] transition-colors">
            <div className="flex items-center gap-3">
              <Star
                className={`w-4 h-4 ${featured ? "text-[var(--purple)]" : "text-[var(--text-muted)]"}`}
              />
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  Featured
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  Show on homepage
                </p>
              </div>
            </div>
            <div
              onClick={() => setFeatured(!featured)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                featured ? "bg-[var(--purple)]" : "bg-[var(--glass-bg-strong)]"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  featured ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </div>
          </label>
        </div>
      </div>

      {/* ── Section 5: Sections & Lessons (read-only overview) ── */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--divider)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-[var(--purple)]" />
            <h2 className="font-semibold text-[var(--text-primary)]">
              Course Content
            </h2>
          </div>
          <a
            href={`/admin/courses/${course.id}/sections`}
            className="text-xs text-[var(--purple)] hover:underline font-medium"
          >
            Manage sections →
          </a>
        </div>

        {course.sections.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <BookOpen className="w-10 h-10 mx-auto mb-3 text-[var(--text-muted)]" />
            <p className="text-sm text-[var(--text-muted)]">
              No sections yet.{" "}
              <a
                href={`/admin/courses/${course.id}/sections`}
                className="text-[var(--purple)] hover:underline"
              >
                Add your first section
              </a>
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--divider)]">
            {course.sections.map((section, idx) => {
              const isOpen = expandedSections.has(section.id);
              return (
                <div key={section.id}>
                  {/* Section header */}
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between px-6 py-3.5 hover:bg-[var(--glass-bg-subtle)] transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-[var(--text-muted)] w-5">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        {section.title}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">
                        {section.lessons.length} lesson
                        {section.lessons.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
                    )}
                  </button>

                  {/* Lessons list */}
                  {isOpen && (
                    <div className="bg-[var(--glass-bg-subtle)] divide-y divide-[var(--divider)]">
                      {section.lessons.length === 0 ? (
                        <p className="px-12 py-3 text-xs text-[var(--text-muted)]">
                          No lessons in this section
                        </p>
                      ) : (
                        section.lessons.map((lesson, lIdx) => (
                          <div
                            key={lesson.id}
                            className="flex items-center gap-3 px-12 py-2.5"
                          >
                            <span className="text-xs font-mono text-[var(--text-muted)] w-5">
                              {lIdx + 1}
                            </span>
                            <span className="text-[var(--text-muted)]">
                              {LESSON_TYPE_ICONS[lesson.type]}
                            </span>
                            <span className="text-sm text-[var(--text-secondary)] flex-1">
                              {lesson.title}
                            </span>
                            {lesson.isFree && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500">
                                Preview
                              </span>
                            )}
                            {lesson.duration && (
                              <span className="text-xs text-[var(--text-muted)]">
                                {lesson.duration}m
                              </span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Submit ── */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 rounded-xl text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="btn-primary flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}
