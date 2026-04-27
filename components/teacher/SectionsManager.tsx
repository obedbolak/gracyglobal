"use client";

import { useState, useEffect } from "react";
import {
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
import VideoUpload from "@/components/shared/VideoUpload";

// ─── Types ────────────────────────────────────────────────────────────────────

type LessonType = "VIDEO" | "TEXT" | "QUIZ" | "LIVE";

interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  content: string;
  videoUrl: string;
  duration: number;
  isFree: boolean;
}

interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
  order: number;
  expanded?: boolean;
}

interface TeacherSectionsManagerProps {
  courseId: string;
  initialSections: Section[];
  onSectionsChange: (sections: Section[]) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LESSON_TYPES: {
  value: LessonType;
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: "VIDEO", label: "Video", icon: <Video className="w-4 h-4" /> },
  { value: "TEXT", label: "Text", icon: <FileText className="w-4 h-4" /> },
  { value: "QUIZ", label: "Quiz", icon: <HelpCircle className="w-4 h-4" /> },
  { value: "LIVE", label: "Live", icon: <Radio className="w-4 h-4" /> },
];

const TYPE_COLORS: Record<LessonType, string> = {
  VIDEO: "bg-[var(--blue-faint)] text-[var(--blue)]",
  TEXT: "bg-[var(--purple-faint)] text-[var(--purple)]",
  QUIZ: "bg-[var(--scarlet-faint)] text-[var(--scarlet)]",
  LIVE: "bg-green-500/10 text-green-500",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const generateId = () => Math.random().toString(36).substring(2, 11);

const emptyLesson = (): Lesson => ({
  id: generateId(),
  title: "",
  type: "VIDEO",
  content: "",
  videoUrl: "",
  duration: 0,
  isFree: false,
});

const emptySection = (): Section => ({
  id: generateId(),
  title: "",
  lessons: [],
  order: 0,
  expanded: true,
});

// ─── Component ────────────────────────────────────────────────────────────────

export default function TeacherSectionsManager({
  courseId,
  initialSections,
  onSectionsChange,
}: TeacherSectionsManagerProps) {
  const [sections, setSections] = useState<Section[]>(
    initialSections.map((s) => ({ ...s, expanded: s.expanded ?? true })),
  );
  const [editingLesson, setEditingLesson] = useState<{
    sectionId: string;
    lessonId: string | null;
  } | null>(null);
  const [lessonDraft, setLessonDraft] = useState<Lesson>(emptyLesson());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSections(
      initialSections.map((s) => ({ ...s, expanded: s.expanded ?? true })),
    );
  }, [initialSections]);

  useEffect(() => {
    onSectionsChange(sections);
  }, [sections, onSectionsChange]);

  // ── Section management ───────────────────────────────────────────────────

  const addSection = () => {
    const newSection = {
      ...emptySection(),
      order: sections.length + 1,
    };
    setSections((prev) => [...prev, newSection]);
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
      // Update orders
      newSections.forEach((s, i) => (s.order = i + 1));
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
      // Update orders
      newSections.forEach((s, i) => (s.order = i + 1));
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

  const startEditLesson = (sectionId: string, lesson: Lesson) => {
    setEditingLesson({ sectionId, lessonId: lesson.id });
    setLessonDraft({ ...lesson });
  };

  const cancelLessonEdit = () => {
    setEditingLesson(null);
    setLessonDraft(emptyLesson());
  };

  const saveLesson = async () => {
    if (!lessonDraft.title.trim()) {
      alert("Lesson title is required");
      return;
    }
    setSaving(true);

    const sectionId = editingLesson?.sectionId;
    if (!sectionId) return;

    try {
      const url = editingLesson.lessonId
        ? `/api/courses/${courseId}/sections/${sectionId}/lessons/${editingLesson.lessonId}`
        : `/api/courses/${courseId}/sections/${sectionId}/lessons`;

      const method = editingLesson.lessonId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: lessonDraft.title,
          type: lessonDraft.type,
          content: lessonDraft.type === "TEXT" ? lessonDraft.content : null,
          videoUrl: lessonDraft.type === "VIDEO" ? lessonDraft.videoUrl : null,
          duration: lessonDraft.duration || null,
          isFree: lessonDraft.isFree,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSections((prev) =>
        prev.map((s) => {
          if (s.id !== sectionId) return s;

          if (editingLesson.lessonId) {
            return {
              ...s,
              lessons: s.lessons.map((l) =>
                l.id === editingLesson.lessonId ? data.lesson : l,
              ),
            };
          } else {
            return {
              ...s,
              lessons: [...s.lessons, data.lesson],
            };
          }
        }),
      );

      cancelLessonEdit();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const renderLessonForm = (sectionId: string) => {
    if (editingLesson?.sectionId !== sectionId) return null;

    return (
      <div className="mt-4 p-4 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)]">
        <h4
          className="text-base font-bold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          {editingLesson.lessonId ? "Edit Lesson" : "Add Lesson"}
        </h4>

        <div className="mb-4">
          <label
            className="block text-sm font-semibold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Title
          </label>
          <input
            type="text"
            value={lessonDraft.title}
            onChange={(e) =>
              setLessonDraft((d) => ({ ...d, title: e.target.value }))
            }
            className="w-full p-3 rounded-xl glass-input text-sm"
            placeholder="Lesson title"
          />
        </div>

        <div className="mb-4">
          <label
            className="block text-sm font-semibold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {LESSON_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() =>
                  setLessonDraft((d) => ({ ...d, type: type.value }))
                }
                className={`p-3 rounded-xl text-sm font-medium transition-all ${
                  lessonDraft.type === type.value
                    ? "btn-primary"
                    : "glass hover:bg-[var(--glass-bg-hover)]"
                }`}
              >
                {type.icon}
                <span className="ml-2">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {lessonDraft.type === "VIDEO" && (
          <div className="mb-4">
            <VideoUpload
              folder="gracyglobal/videos" // was "courses"
              label="Video File"
              currentVideo={lessonDraft.videoUrl}
              onUploadComplete={(url, publicId, duration) =>
                setLessonDraft((d) => ({
                  ...d,
                  videoUrl: url,
                  duration: duration ? Math.ceil(duration / 60) : d.duration,
                }))
              }
            />
          </div>
        )}

        {lessonDraft.type === "TEXT" && (
          <div className="mb-4">
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Content
            </label>
            <textarea
              value={lessonDraft.content}
              onChange={(e) =>
                setLessonDraft((d) => ({ ...d, content: e.target.value }))
              }
              rows={8}
              className="w-full p-3 rounded-xl glass-input text-sm resize-none"
              placeholder="Lesson content..."
            />
          </div>
        )}

        {lessonDraft.type === "QUIZ" && (
          <div className="mb-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Quiz functionality will be available soon.
            </p>
          </div>
        )}

        {lessonDraft.type === "LIVE" && (
          <div className="mb-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Live session functionality will be available soon.
            </p>
          </div>
        )}

        <div className="mb-4">
          <label
            className="block text-sm font-semibold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Duration (minutes)
          </label>
          <input
            type="number"
            value={lessonDraft.duration}
            onChange={(e) =>
              setLessonDraft((d) => ({
                ...d,
                duration: parseInt(e.target.value) || 0,
              }))
            }
            min={0}
            className="w-full p-3 rounded-xl glass-input text-sm"
          />
        </div>

        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={lessonDraft.isFree}
              onChange={(e) =>
                setLessonDraft((d) => ({ ...d, isFree: e.target.checked }))
              }
              className="w-4 h-4 rounded"
            />
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Free Preview
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Allow students to view this lesson without purchasing
              </p>
            </div>
          </label>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={cancelLessonEdit}
            className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold glass"
            style={{ color: "var(--text-secondary)" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={saveLesson}
            disabled={saving}
            className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold btn-primary disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
            ) : editingLesson.lessonId ? (
              "Save Changes"
            ) : (
              "Add Lesson"
            )}
          </button>
        </div>
      </div>
    );
  };

  const deleteLesson = (sectionId: string, lessonId: string) => {
    if (!confirm("Delete this lesson?")) return;

    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, lessons: s.lessons.filter((l) => l.id !== lessonId) }
          : s,
      ),
    );

    // Also delete from API
    fetch(
      `/api/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`,
      {
        method: "DELETE",
      },
    ).catch(() => {}); // Ignore errors
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

  // ── Render ───────────────────────────────────────────────────────────────

  return (
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
            Manage Course Content
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
            className="text-lg font-bold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            No sections yet
          </h3>
          <p
            className="text-sm mb-6"
            style={{ color: "var(--text-secondary)" }}
          >
            Add your first section to start building the course
          </p>
          <button
            type="button"
            onClick={addSection}
            className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Section
          </button>
        </div>
      ) : (
        sections.map((section, sIdx) => (
          <div
            key={section.id}
            className="rounded-2xl"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
            }}
          >
            {/* Section header */}
            <div className="p-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="p-1 rounded-lg hover:bg-[var(--glass-bg-hover)] transition-colors"
                >
                  {section.expanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                <div className="flex-1">
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) =>
                      updateSectionTitle(section.id, e.target.value)
                    }
                    placeholder="Section title"
                    className="w-full bg-transparent text-sm font-semibold border-none outline-none"
                    style={{ color: "var(--text-primary)" }}
                  />
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveSectionUp(sIdx)}
                    disabled={sIdx === 0}
                    className="p-1 rounded-lg hover:bg-[var(--glass-bg-hover)] disabled:opacity-30"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSectionDown(sIdx)}
                    disabled={sIdx === sections.length - 1}
                    className="p-1 rounded-lg hover:bg-[var(--glass-bg-hover)] disabled:opacity-30"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSection(section.id)}
                    className="p-1 rounded-lg hover:bg-[var(--glass-bg-hover)] text-[var(--error-text)]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Section content */}
            {section.expanded && (
              <div className="px-4 pb-4">
                {/* Lessons list */}
                <div className="space-y-2 mb-4">
                  {section.lessons.map((lesson, lIdx) => (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{
                        background: "var(--glass-bg-subtle)",
                        border: "1px solid var(--glass-border)",
                      }}
                    >
                      <GripVertical className="w-4 h-4 text-[var(--text-muted)]" />

                      <div
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${TYPE_COLORS[lesson.type]}`}
                      >
                        {
                          LESSON_TYPES.find((t) => t.value === lesson.type)
                            ?.icon
                        }
                        {lesson.type}
                      </div>

                      <div className="flex-1">
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {lesson.title || "Untitled"}
                        </p>
                        {lesson.isFree && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/10 text-green-500">
                            Free
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveLessonUp(section.id, lIdx)}
                          disabled={lIdx === 0}
                          className="p-1 rounded hover:bg-[var(--glass-bg-hover)] disabled:opacity-30"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveLessonDown(section.id, lIdx)}
                          disabled={lIdx === section.lessons.length - 1}
                          className="p-1 rounded hover:bg-[var(--glass-bg-hover)] disabled:opacity-30"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => startEditLesson(section.id, lesson)}
                          className="p-1 rounded hover:bg-[var(--glass-bg-hover)]"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteLesson(section.id, lesson.id)}
                          className="p-1 rounded hover:bg-[var(--glass-bg-hover)] text-[var(--error-text)]"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add lesson button */}
                <button
                  type="button"
                  onClick={() => startAddLesson(section.id)}
                  className="w-full p-3 rounded-xl border-2 border-dashed text-sm font-medium transition-all hover:scale-105"
                  style={{
                    borderColor: "var(--glass-border)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Add Lesson
                </button>

                {renderLessonForm(section.id)}
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
          className="w-full p-4 rounded-2xl border-2 border-dashed text-sm font-medium transition-all hover:scale-105"
          style={{
            background: "var(--glass-bg)",
            borderColor: "var(--glass-border)",
            color: "var(--text-secondary)",
          }}
        >
          <Plus className="w-5 h-5 inline mr-2" />
          Add Section
        </button>
      )}
    </div>
  );
}
