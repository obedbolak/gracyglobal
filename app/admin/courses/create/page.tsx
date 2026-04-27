// app/admin/courses/create/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Plus,
  Trash2,
  GripVertical,
  Video,
  FileText,
  HelpCircle,
  Radio,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Loader2,
  Eye,
  EyeOff,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import ImageUpload from "@/components/shared/ImageUpload";
import VideoUpload from "@/components/shared/VideoUpload";
import DocumentUpload from "@/components/shared/DocumentUpload";
import { useCategories, CategoryType } from "@/hooks/useCategories";

// ─── Types ────────────────────────────────────────────────────────────────────

type LessonType = "VIDEO" | "TEXT" | "DOCUMENT" | "QUIZ" | "LIVE";
type CourseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

interface LessonDraft {
  id: string;
  title: string;
  type: LessonType;
  content: string;
  videoUrl: string;
  documentUrl: string; // ← ADD

  duration: number;
  isFree: boolean;
}

interface SectionDraft {
  id: string;
  title: string;
  lessons: LessonDraft[];
  expanded: boolean;
}

interface CourseFormData {
  title: string;
  description: string;
  thumbnail: string;
  level: string;
  categoryId: string; // ← was: category: string  level: CourseLevel;
  price: number;
  isFree: boolean;
  published: boolean;
  featured: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

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

const LEVELS: { value: CourseLevel; label: string }[] = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
];

const LESSON_TYPES: {
  value: LessonType;
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: "VIDEO", label: "Video", icon: <Video className="w-4 h-4" /> },
  { value: "TEXT", label: "Text", icon: <FileText className="w-4 h-4" /> },
  {
    value: "DOCUMENT",
    label: "Document",
    icon: <BookOpen className="w-4 h-4" />,
  },
  { value: "QUIZ", label: "Quiz", icon: <HelpCircle className="w-4 h-4" /> },
  { value: "LIVE", label: "Live", icon: <Radio className="w-4 h-4" /> },
];

const TYPE_COLORS: Record<LessonType, string> = {
  VIDEO: "bg-[var(--blue-faint)] text-[var(--blue)]",
  TEXT: "bg-[var(--purple-faint)] text-[var(--purple)]",
  DOCUMENT: "bg-[var(--orange-faint)] text-[var(--orange)]",
  QUIZ: "bg-[var(--scarlet-faint)] text-[var(--scarlet)]",
  LIVE: "bg-green-500/10 text-green-500",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const generateId = () => Math.random().toString(36).substring(2, 11);

const emptyLesson = (): LessonDraft => ({
  id: generateId(),
  title: "",
  type: "VIDEO",
  content: "",
  videoUrl: "",
  documentUrl: "",
  duration: 0,
  isFree: false,
});

const emptySection = (): SectionDraft => ({
  id: generateId(),
  title: "",
  lessons: [],
  expanded: true,
});

// ─── Steps ────────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Course Details" },
  { id: 2, label: "Content Structure" },
  { id: 3, label: "Review & Publish" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateCoursePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { categories, loading: categoriesLoading } = useCategories("course");

  // Course details
  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    description: "",
    thumbnail: "",
    categoryId: "",
    level: "BEGINNER",
    price: 0,
    isFree: true,
    published: false,
    featured: false,
  });

  // Sections & lessons
  const [sections, setSections] = useState<SectionDraft[]>([]);
  const [editingLesson, setEditingLesson] = useState<{
    sectionId: string;
    lessonId: string | null;
  } | null>(null);
  const [lessonDraft, setLessonDraft] = useState<LessonDraft>(emptyLesson());

  // ── Validation ───────────────────────────────────────────────────────────

  const canProceedStep1 = !!(
    formData.title.trim() && formData.description.trim()
  );
  const canProceedStep2 =
    sections.length > 0 &&
    sections.every((s) => !!s.title.trim()) &&
    sections.some((s) => s.lessons.length > 0);
  const canSubmit = canProceedStep1 && canProceedStep2;

  // ── Step navigation ──────────────────────────────────────────────────────

  const nextStep = () => {
    if (step === 1 && !canProceedStep1) {
      setError("Please fill in course title and description");
      return;
    }

    if (step === 2) {
      if (sections.length === 0) {
        setError("Please add at least one section");
        return;
      }
      const emptySections = sections.filter((s) => !s.title.trim());
      if (emptySections.length > 0) {
        setError("All sections must have a title");
        return;
      }
      const totalLessonsCount = sections.reduce(
        (acc, s) => acc + s.lessons.length,
        0,
      );
      if (totalLessonsCount === 0) {
        setError("Please add at least one lesson to your course");
        return;
      }
    }

    setError("");
    setStep((s) => Math.min(3, s + 1));
  };

  const prevStep = () => {
    setError("");
    setStep((s) => Math.max(1, s - 1));
  };

  // ── Section management ───────────────────────────────────────────────────

  const addSection = () => {
    setSections((prev) => [...prev, emptySection()]);
  };

  const updateSectionTitle = (sectionId: string, title: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, title } : s)),
    );
  };

  const deleteSection = (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (
      section &&
      section.lessons.length > 0 &&
      !confirm(
        `Delete "${section.title || "Untitled section"}"? This will also delete ${section.lessons.length} lesson(s).`,
      )
    ) {
      return;
    }
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
  };

  const toggleSection = (sectionId: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, expanded: !s.expanded } : s,
      ),
    );
  };

  const moveSectionUp = (index: number) => {
    if (index === 0) return;
    setSections((prev) => {
      const newSections = [...prev];
      [newSections[index - 1], newSections[index]] = [
        newSections[index],
        newSections[index - 1],
      ];
      return newSections;
    });
  };

  const moveSectionDown = (index: number) => {
    if (index === sections.length - 1) return;
    setSections((prev) => {
      const newSections = [...prev];
      [newSections[index], newSections[index + 1]] = [
        newSections[index + 1],
        newSections[index],
      ];
      return newSections;
    });
  };

  // ── Lesson management ────────────────────────────────────────────────────

  const startAddLesson = (sectionId: string) => {
    setEditingLesson({ sectionId, lessonId: null });
    setLessonDraft(emptyLesson());
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, expanded: true } : s)),
    );
  };

  const startEditLesson = (sectionId: string, lesson: LessonDraft) => {
    setEditingLesson({ sectionId, lessonId: lesson.id });
    setLessonDraft({ ...lesson });
  };

  const cancelLessonEdit = () => {
    setEditingLesson(null);
    setLessonDraft(emptyLesson());
  };

  const saveLesson = () => {
    if (!lessonDraft.title.trim()) {
      alert("Lesson title is required");
      return;
    }
    if (!editingLesson) return;

    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== editingLesson.sectionId) return s;

        if (editingLesson.lessonId) {
          return {
            ...s,
            lessons: s.lessons.map((l) =>
              l.id === editingLesson.lessonId ? { ...lessonDraft } : l,
            ),
          };
        } else {
          return {
            ...s,
            lessons: [...s.lessons, { ...lessonDraft, id: generateId() }],
          };
        }
      }),
    );

    cancelLessonEdit();
  };

  const deleteLesson = (sectionId: string, lessonId: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, lessons: s.lessons.filter((l) => l.id !== lessonId) }
          : s,
      ),
    );
  };

  const moveLessonUp = (sectionId: string, lessonIndex: number) => {
    if (lessonIndex === 0) return;
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        const newLessons = [...s.lessons];
        [newLessons[lessonIndex - 1], newLessons[lessonIndex]] = [
          newLessons[lessonIndex],
          newLessons[lessonIndex - 1],
        ];
        return { ...s, lessons: newLessons };
      }),
    );
  };

  const moveLessonDown = (sectionId: string, lessonIndex: number) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section || lessonIndex === section.lessons.length - 1) return;
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        const newLessons = [...s.lessons];
        [newLessons[lessonIndex], newLessons[lessonIndex + 1]] = [
          newLessons[lessonIndex + 1],
          newLessons[lessonIndex],
        ];
        return { ...s, lessons: newLessons };
      }),
    );
  };

  // ── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      setError("Course title is required");
      return;
    }
    if (!formData.description.trim()) {
      setError("Course description is required");
      return;
    }
    if (sections.length === 0) {
      setError("Please add at least one section");
      return;
    }
    const emptySections = sections.filter((s) => !s.title.trim());
    if (emptySections.length > 0) {
      setError(
        `${emptySections.length} section(s) have no title. Please go back and fill them in.`,
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        ...formData,
        price: formData.isFree ? 0 : formData.price,
        sections: sections.map((s, sIdx) => ({
          title: s.title.trim(),
          order: sIdx + 1,
          lessons: s.lessons.map((l, lIdx) => ({
            title: l.title.trim(),
            type: l.type,
            content: l.type === "TEXT" ? l.content : null,
            videoUrl: l.type === "VIDEO" ? l.videoUrl : null,
            documentUrl: l.type === "DOCUMENT" ? l.documentUrl : null, // ← ADD
            duration: l.duration || null,
            isFree: l.isFree,
            order: lIdx + 1,
          })),
        })),
      };

      console.log("Submitting course:", payload);

      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("API response:", data);

      if (!res.ok) {
        throw new Error(
          data.error || `Failed to create course (${res.status})`,
        );
      }

      if (!data.course?.id) {
        throw new Error("Course created but no ID returned");
      }

      router.push(`/admin/courses/${data.course.id}/sections`);
    } catch (err: any) {
      console.error("Submit error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // ── Calculate stats ──────────────────────────────────────────────────────

  const totalLessons = sections.reduce((acc, s) => acc + s.lessons.length, 0);
  const totalDuration = sections.reduce(
    (acc, s) => acc + s.lessons.reduce((a, l) => a + (l.duration || 0), 0),
    0,
  );

  useEffect(() => {
    if (categories.length > 0 && !formData.categoryId) {
      setFormData((f) => ({ ...f, categoryId: categories[0].id }));
    }
  }, [categories]);

  // ── Render Step 1: Course Details ────────────────────────────────────────

  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Thumbnail */}
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
          currentImage={formData.thumbnail}
          aspectRatio="video"
          maxSize={5}
          onUploadComplete={(url) =>
            setFormData((f) => ({ ...f, thumbnail: url }))
          }
        />
        <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
          Recommended size: 1280x720 pixels (16:9 aspect ratio)
        </p>
      </div>

      {/* Basic Info */}
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
            value={formData.title}
            onChange={(e) =>
              setFormData((f) => ({ ...f, title: e.target.value }))
            }
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
            value={formData.description}
            onChange={(e) =>
              setFormData((f) => ({ ...f, description: e.target.value }))
            }
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
              value={formData.categoryId}
              onChange={(e) =>
                setFormData((f) => ({ ...f, categoryId: e.target.value }))
              }
              className="w-full p-3 rounded-xl glass-input text-sm"
            >
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
              value={formData.level}
              onChange={(e) =>
                setFormData((f) => ({
                  ...f,
                  level: e.target.value as CourseLevel,
                }))
              }
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

      {/* Pricing */}
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
            onClick={() => setFormData((f) => ({ ...f, isFree: true }))}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: formData.isFree
                ? "linear-gradient(135deg, var(--purple), var(--blue))"
                : "var(--glass-bg)",
              color: formData.isFree ? "#fff" : "var(--text-secondary)",
              border: formData.isFree
                ? "none"
                : "1px solid var(--glass-border)",
              boxShadow: formData.isFree
                ? "0 4px 12px rgba(123,47,190,0.3)"
                : "none",
            }}
          >
            Free Course
          </button>
          <button
            type="button"
            onClick={() => setFormData((f) => ({ ...f, isFree: false }))}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: !formData.isFree
                ? "linear-gradient(135deg, var(--purple), var(--blue))"
                : "var(--glass-bg)",
              color: !formData.isFree ? "#fff" : "var(--text-secondary)",
              border: !formData.isFree
                ? "none"
                : "1px solid var(--glass-border)",
              boxShadow: !formData.isFree
                ? "0 4px 12px rgba(123,47,190,0.3)"
                : "none",
            }}
          >
            Paid Course
          </button>
        </div>

        {!formData.isFree && (
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Price (XAF)
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData((f) => ({
                  ...f,
                  price: parseInt(e.target.value) || 0,
                }))
              }
              min={0}
              placeholder="5000"
              className="w-full p-3 rounded-xl glass-input text-sm"
            />
          </div>
        )}
      </div>

      {/* Settings */}
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
            onClick={() =>
              setFormData((f) => ({ ...f, featured: !f.featured }))
            }
            className="relative w-10 h-6 rounded-full transition-colors"
            style={{
              background: formData.featured
                ? "linear-gradient(135deg, var(--purple), var(--blue))"
                : "var(--glass-bg-strong)",
              border: formData.featured
                ? "none"
                : "1px solid var(--glass-border)",
            }}
          >
            <span
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
              style={{
                left: formData.featured ? "calc(100% - 1.375rem)" : "0.125rem",
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
    </div>
  );

  // ── Render Step 2: Content Structure ─────────────────────────────────────

  const renderStep2 = () => (
    <div className="space-y-4">
      {/* Info banner */}
      <div
        className="p-4 rounded-xl flex items-start gap-3"
        style={{
          background: "var(--info-bg)",
          border: "1px solid var(--info-border)",
        }}
      >
        <BookOpen
          className="w-5 h-5 flex-shrink-0 mt-0.5"
          style={{ color: "var(--info-text)" }}
        />
        <div>
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--info-text)" }}
          >
            Build Your Course Structure
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Add sections to organize your content, then add lessons to each
            section. You can reorder sections and lessons by using the arrow
            buttons.
          </p>
        </div>
      </div>

      {/* Sections */}
      {sections.length === 0 ? (
        <div
          className="p-12 rounded-2xl text-center"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <BookOpen
            className="w-12 h-12 mx-auto mb-3"
            style={{ color: "var(--text-disabled)" }}
          />
          <h3
            className="font-semibold mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            No sections yet
          </h3>
          <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>
            Start by adding your first section
          </p>
          <button
            type="button"
            onClick={addSection}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{
              background: "linear-gradient(135deg, var(--purple), var(--blue))",
              boxShadow: "0 4px 12px rgba(123,47,190,0.3)",
            }}
          >
            <Plus className="w-4 h-4" />
            Add Section
          </button>
        </div>
      ) : (
        sections.map((section, sIdx) => (
          <div
            key={section.id}
            className="rounded-2xl overflow-hidden"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
            }}
          >
            {/* Section header */}
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{
                background: "var(--glass-bg-strong)",
                borderBottom: section.expanded
                  ? "1px solid var(--divider)"
                  : "none",
              }}
            >
              <GripVertical
                className="w-4 h-4 flex-shrink-0"
                style={{ color: "var(--text-muted)" }}
              />

              <span
                className="text-xs font-mono w-6 flex-shrink-0"
                style={{ color: "var(--text-muted)" }}
              >
                {sIdx + 1}
              </span>

              <input
                type="text"
                value={section.title}
                onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                placeholder="Section title..."
                className="flex-1 bg-transparent text-sm font-semibold outline-none"
                style={{ color: "var(--text-primary)" }}
              />

              <span
                className="text-xs flex-shrink-0"
                style={{ color: "var(--text-muted)" }}
              >
                {section.lessons.length} lesson
                {section.lessons.length !== 1 ? "s" : ""}
              </span>

              {/* Section controls */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => moveSectionUp(sIdx)}
                  disabled={sIdx === 0}
                  className="p-1.5 rounded-lg transition-colors disabled:opacity-30"
                  style={{ color: "var(--text-muted)" }}
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveSectionDown(sIdx)}
                  disabled={sIdx === sections.length - 1}
                  className="p-1.5 rounded-lg transition-colors disabled:opacity-30"
                  style={{ color: "var(--text-muted)" }}
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => startAddLesson(section.id)}
                  className="p-1.5 rounded-lg transition-colors hover:bg-[var(--purple-faint)]"
                  style={{ color: "var(--purple)" }}
                  title="Add lesson"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteSection(section.id)}
                  className="p-1.5 rounded-lg transition-colors hover:bg-[var(--scarlet-faint)]"
                  style={{ color: "var(--scarlet)" }}
                  title="Delete section"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: "var(--text-muted)" }}
                >
                  {section.expanded ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Lessons */}
            {section.expanded && (
              <div className="py-2">
                {section.lessons.length === 0 &&
                  editingLesson?.sectionId !== section.id && (
                    <p
                      className="px-12 py-4 text-xs text-center"
                      style={{ color: "var(--text-muted)" }}
                    >
                      No lessons yet —{" "}
                      <button
                        type="button"
                        onClick={() => startAddLesson(section.id)}
                        style={{ color: "var(--purple)" }}
                        className="hover:underline"
                      >
                        add one
                      </button>
                    </p>
                  )}

                {section.lessons.map((lesson, lIdx) => {
                  const isEditing =
                    editingLesson?.sectionId === section.id &&
                    editingLesson?.lessonId === lesson.id;

                  if (isEditing) {
                    return (
                      <div key={lesson.id} className="px-4 py-2">
                        {renderLessonForm(section.id)}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-3 px-4 py-2.5 transition-colors group hover:bg-[var(--glass-bg-subtle)]"
                    >
                      <GripVertical
                        className="w-3.5 h-3.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: "var(--text-muted)" }}
                      />

                      <span
                        className="text-xs font-mono w-5 flex-shrink-0"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {lIdx + 1}
                      </span>

                      <span
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${TYPE_COLORS[lesson.type]}`}
                      >
                        {
                          LESSON_TYPES.find((t) => t.value === lesson.type)
                            ?.icon
                        }
                        {lesson.type}
                      </span>

                      <span
                        className="flex-1 text-sm"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {lesson.title || (
                          <em style={{ color: "var(--text-muted)" }}>
                            Untitled
                          </em>
                        )}
                      </span>

                      {lesson.isFree && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 flex-shrink-0">
                          Preview
                        </span>
                      )}

                      {lesson.duration > 0 && (
                        <span
                          className="text-xs flex-shrink-0"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {lesson.duration}m
                        </span>
                      )}

                      {/* Lesson controls */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => moveLessonUp(section.id, lIdx)}
                          disabled={lIdx === 0}
                          className="p-1 rounded transition-colors disabled:opacity-30"
                          style={{ color: "var(--text-muted)" }}
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveLessonDown(section.id, lIdx)}
                          disabled={lIdx === section.lessons.length - 1}
                          className="p-1 rounded transition-colors disabled:opacity-30"
                          style={{ color: "var(--text-muted)" }}
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => startEditLesson(section.id, lesson)}
                          className="p-1.5 rounded-lg transition-colors hover:bg-[var(--glass-bg-subtle)]"
                          style={{ color: "var(--text-muted)" }}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteLesson(section.id, lesson.id)}
                          className="p-1.5 rounded-lg transition-colors hover:bg-[var(--scarlet-faint)]"
                          style={{ color: "var(--scarlet)" }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* New lesson form */}
                {editingLesson?.sectionId === section.id &&
                  editingLesson?.lessonId === null && (
                    <div className="px-4 py-2">
                      {renderLessonForm(section.id)}
                    </div>
                  )}

                {/* Add lesson button */}
                {editingLesson?.sectionId !== section.id && (
                  <button
                    type="button"
                    onClick={() => startAddLesson(section.id)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-xs transition-colors hover:bg-[var(--purple-faint)]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Lesson
                  </button>
                )}
              </div>
            )}
          </div>
        ))
      )}

      {/* Add section button */}
      {sections.length > 0 && (
        <button
          type="button"
          onClick={addSection}
          className="w-full rounded-xl py-3.5 flex items-center justify-center gap-2 text-sm transition-colors border border-dashed"
          style={{
            background: "var(--glass-bg)",
            borderColor: "var(--divider)",
            color: "var(--text-muted)",
          }}
        >
          <Plus className="w-4 h-4" />
          Add Section
        </button>
      )}
    </div>
  );

  // ── Lesson form ──────────────────────────────────────────────────────────

  const renderLessonForm = (sectionId: string) => (
    <div
      className="p-5 rounded-xl space-y-4"
      style={{
        background: "var(--glass-bg-subtle)",
        border: "1px solid var(--purple-light)",
      }}
    >
      <h4
        className="text-sm font-bold"
        style={{ color: "var(--text-primary)" }}
      >
        {editingLesson?.lessonId ? "Edit Lesson" : "New Lesson"}
      </h4>

      {/* Title */}
      <div>
        <label
          className="text-xs font-medium"
          style={{ color: "var(--text-muted)" }}
        >
          Title <span style={{ color: "var(--scarlet)" }}>*</span>
        </label>
        <input
          type="text"
          value={lessonDraft.title}
          onChange={(e) =>
            setLessonDraft((d) => ({ ...d, title: e.target.value }))
          }
          placeholder="e.g. Introduction to the topic"
          className="w-full mt-1 p-3 rounded-xl glass-input text-sm"
          autoFocus
        />
      </div>

      {/* Type */}
      <div>
        <label
          className="text-xs font-medium"
          style={{ color: "var(--text-muted)" }}
        >
          Lesson Type
        </label>
        <div className="flex gap-2 flex-wrap mt-2">
          {LESSON_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setLessonDraft((d) => ({ ...d, type: t.value }))}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                lessonDraft.type === t.value
                  ? TYPE_COLORS[t.value] + " ring-1 ring-current"
                  : "glass hover:bg-[var(--glass-bg-hover)]"
              }`}
              style={{
                color:
                  lessonDraft.type === t.value
                    ? undefined
                    : "var(--text-muted)",
              }}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Video Upload */}
      {lessonDraft.type === "VIDEO" && (
        <VideoUpload
          folder="gracyglobal/videos" // was "courses/videos"
          label="Lesson Video"
          currentVideo={lessonDraft.videoUrl}
          onUploadComplete={(url, publicId, duration) => {
            setLessonDraft((d) => ({
              ...d,
              videoUrl: url,
              duration: duration ? Math.ceil(duration / 60) : d.duration,
            }));
          }}
        />
      )}

      {/* Text content */}
      {lessonDraft.type === "TEXT" && (
        <div>
          <label
            className="text-xs font-medium"
            style={{ color: "var(--text-muted)" }}
          >
            Content
          </label>
          <textarea
            value={lessonDraft.content}
            onChange={(e) =>
              setLessonDraft((d) => ({ ...d, content: e.target.value }))
            }
            placeholder="Lesson content (supports Markdown)..."
            rows={5}
            className="w-full mt-1 p-3 rounded-xl glass-input text-sm resize-none"
          />
        </div>
      )}

      {lessonDraft.type === "DOCUMENT" && (
        <DocumentUpload
          folder="gracyglobal/documents"
          label="Lesson Document"
          currentDocument={
            lessonDraft.documentUrl
              ? { url: lessonDraft.documentUrl, filename: "Current document" }
              : undefined
          }
          onUploadComplete={(url, publicId, filename) => {
            setLessonDraft((d) => ({ ...d, documentUrl: url }));
          }}
        />
      )}

      {/* Duration + Free preview */}
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label
            className="text-xs font-medium"
            style={{ color: "var(--text-muted)" }}
          >
            Duration (minutes)
          </label>
          <input
            type="number"
            value={lessonDraft.duration || ""}
            onChange={(e) =>
              setLessonDraft((d) => ({
                ...d,
                duration: parseInt(e.target.value) || 0,
              }))
            }
            placeholder="15"
            min={1}
            className="w-full mt-1 p-3 rounded-xl glass-input text-sm"
          />
        </div>

        <label className="flex items-center gap-2 pb-3 cursor-pointer">
          <div
            onClick={() => setLessonDraft((d) => ({ ...d, isFree: !d.isFree }))}
            className="relative w-9 h-5 rounded-full transition-colors"
            style={{
              background: lessonDraft.isFree
                ? "linear-gradient(135deg, var(--purple), var(--blue))"
                : "var(--glass-bg-strong)",
            }}
          >
            <span
              className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
              style={{
                transform: lessonDraft.isFree
                  ? "translateX(1rem)"
                  : "translateX(0)",
              }}
            />
          </div>
          <span
            className="text-xs font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Free preview
          </span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={cancelLessonEdit}
          className="flex items-center gap-1.5 px-4 py-2 text-xs rounded-lg glass transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          <X className="w-3.5 h-3.5" />
          Cancel
        </button>
        <button
          type="button"
          onClick={saveLesson}
          className="flex items-center gap-1.5 px-4 py-2 text-xs rounded-lg text-white font-semibold transition-all"
          style={{
            background: "linear-gradient(135deg, var(--purple), var(--blue))",
          }}
        >
          <Check className="w-3.5 h-3.5" />
          {editingLesson?.lessonId ? "Save Changes" : "Add Lesson"}
        </button>
      </div>
    </div>
  );

  // ── Render Step 3: Review ────────────────────────────────────────────────

  const renderStep3 = () => (
    <div className="space-y-6">
      {/* Course summary */}
      <div
        className="p-6 rounded-2xl"
        style={{
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
        }}
      >
        <h3
          className="text-lg font-bold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Course Summary
        </h3>

        <div className="flex gap-6 items-start">
          {formData.thumbnail && (
            <div className="w-32 h-20 rounded-xl overflow-hidden flex-shrink-0">
              <img
                src={formData.thumbnail}
                alt="Thumbnail"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <h4
              className="text-xl font-extrabold"
              style={{ color: "var(--text-primary)" }}
            >
              {formData.title}
            </h4>
            <p
              className="text-sm mt-1 line-clamp-2"
              style={{ color: "var(--text-secondary)" }}
            >
              {formData.description}
            </p>
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <span
                className="px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{
                  background: "var(--badge-purple-bg)",
                  color: "var(--badge-purple-text)",
                }}
              >
                {categories.find((c) => c.id === formData.categoryId)?.name ||
                  "Uncategorized"}
              </span>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{
                  background: "var(--badge-blue-bg)",
                  color: "var(--badge-blue-text)",
                }}
              >
                {formData.level}
              </span>
              <span
                className="text-sm font-bold"
                style={{ color: "var(--accent-primary)" }}
              >
                {formData.isFree
                  ? "Free"
                  : `${formData.price.toLocaleString()} XAF`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div
          className="p-5 rounded-2xl text-center"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <p
            className="text-3xl font-extrabold"
            style={{ color: "var(--text-primary)" }}
          >
            {sections.length}
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Sections
          </p>
        </div>
        <div
          className="p-5 rounded-2xl text-center"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <p
            className="text-3xl font-extrabold"
            style={{ color: "var(--text-primary)" }}
          >
            {totalLessons}
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Lessons
          </p>
        </div>
        <div
          className="p-5 rounded-2xl text-center"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <p
            className="text-3xl font-extrabold"
            style={{ color: "var(--text-primary)" }}
          >
            {totalDuration}
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Minutes
          </p>
        </div>
      </div>

      {/* Content preview */}
      <div
        className="p-6 rounded-2xl"
        style={{
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
        }}
      >
        <h3
          className="text-lg font-bold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Course Content
        </h3>

        <div className="space-y-3">
          {sections.map((section, sIdx) => (
            <div key={section.id}>
              <div className="flex items-center gap-2 py-2">
                <span
                  className="text-xs font-mono w-5"
                  style={{ color: "var(--text-muted)" }}
                >
                  {sIdx + 1}
                </span>
                <span
                  className="font-semibold text-sm"
                  style={{ color: "var(--text-primary)" }}
                >
                  {section.title || "Untitled Section"}
                </span>
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  ({section.lessons.length} lessons)
                </span>
              </div>
              <div className="ml-7 space-y-1">
                {section.lessons.map((lesson, lIdx) => (
                  <div
                    key={lesson.id}
                    className="flex items-center gap-2 py-1.5"
                  >
                    <span
                      className="text-xs font-mono w-4"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {lIdx + 1}
                    </span>
                    <span
                      className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${TYPE_COLORS[lesson.type]}`}
                    >
                      {LESSON_TYPES.find((t) => t.value === lesson.type)?.icon}
                    </span>
                    <span
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {lesson.title || "Untitled"}
                    </span>
                    {lesson.isFree && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-500">
                        Free
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Publish option */}
      <div
        className="p-6 rounded-2xl"
        style={{
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
        }}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              setFormData((f) => ({ ...f, published: !f.published }))
            }
            className="relative w-10 h-6 rounded-full transition-colors flex-shrink-0"
            style={{
              background: formData.published
                ? "linear-gradient(135deg, var(--success-text), #10b981)"
                : "var(--glass-bg-strong)",
              border: formData.published
                ? "none"
                : "1px solid var(--glass-border)",
            }}
          >
            <span
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all pointer-events-none"
              style={{
                left: formData.published ? "calc(100% - 1.375rem)" : "0.125rem",
              }}
            />
          </button>
          <div className="flex-1">
            <p
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Publish Course Now
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {formData.published
                ? "Course will be visible to students immediately"
                : "Save as draft and publish later"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Main render ──────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/courses"
          className="p-2 rounded-lg transition-colors hover:bg-[var(--glass-bg-hover)]"
        >
          <ArrowLeft
            className="w-5 h-5"
            style={{ color: "var(--text-muted)" }}
          />
        </Link>
        <div>
          <h1
            className="text-3xl font-extrabold"
            style={{ color: "var(--text-primary)" }}
          >
            Create Course
          </h1>
          <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
            Step {step} of {STEPS.length}: {STEPS[step - 1].label}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={{
                  background:
                    step > s.id
                      ? "linear-gradient(135deg, var(--purple), var(--blue))"
                      : step === s.id
                        ? "var(--glass-bg-strong)"
                        : "var(--glass-bg-subtle)",
                  color:
                    step > s.id
                      ? "#fff"
                      : step === s.id
                        ? "var(--text-primary)"
                        : "var(--text-disabled)",
                  border:
                    step === s.id
                      ? "2px solid var(--purple-light)"
                      : "1px solid var(--glass-border)",
                }}
              >
                {step > s.id ? <Check className="w-4 h-4" /> : s.id}
              </div>
              <span
                className="hidden sm:block text-xs font-medium"
                style={{
                  color:
                    step >= s.id
                      ? "var(--text-primary)"
                      : "var(--text-disabled)",
                }}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="flex-1 h-0.5 mx-3"
                style={{
                  background:
                    step > s.id
                      ? "linear-gradient(90deg, var(--purple), var(--blue))"
                      : "var(--divider)",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Error */}
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

      {/* Step content */}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}

      {/* Navigation */}
      <div
        className="flex items-center justify-between pt-6"
        style={{ borderTop: "1px solid var(--divider)" }}
      >
        <button
          type="button"
          onClick={prevStep}
          disabled={step === 1}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-30"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
            color: "var(--text-secondary)",
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {step < 3 ? (
          <button
            type="button"
            onClick={nextStep}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
            style={{
              background: "linear-gradient(135deg, var(--purple), var(--blue))",
              boxShadow: "0 4px 12px rgba(123,47,190,0.3)",
            }}
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center gap-3">
            {/* Show validation status */}
            {!canSubmit && (
              <span
                className="text-xs max-w-[200px] text-right"
                style={{ color: "var(--error-text)" }}
              >
                {!canProceedStep1
                  ? "Missing title or description"
                  : "Check section titles & lessons"}
              </span>
            )}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-70 disabled:hover:scale-100"
              style={{
                background: formData.published
                  ? "linear-gradient(135deg, var(--success-text), #10b981)"
                  : "linear-gradient(135deg, var(--purple), var(--blue))",
                boxShadow: formData.published
                  ? "0 4px 12px rgba(16,185,129,0.3)"
                  : "0 4px 12px rgba(123,47,190,0.3)",
                opacity: !canSubmit && !saving ? 0.5 : undefined,
              }}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {formData.published ? "Publish Course" : "Save as Draft"}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
