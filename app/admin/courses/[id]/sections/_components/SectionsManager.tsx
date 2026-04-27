"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LessonType } from "@prisma/client";
import {
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Video,
  FileText,
  HelpCircle,
  Radio,
  Loader2,
  Eye,
  EyeOff,
  BookOpen,
} from "lucide-react";
import DocumentUpload from "@/components/shared/DocumentUpload";

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuizMeta {
  id: string;
  passingScore: number;
}

interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  content: string | null;
  videoUrl: string | null;
  documentUrl: string | null;
  duration: number | null;
  isFree: boolean;
  order: number;
  quiz?: QuizMeta | null;
}

interface Section {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface SectionsManagerProps {
  courseId: string;
  initialSections: Section[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

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

const TYPE_ICONS: Record<LessonType, React.ReactNode> = {
  VIDEO: <Video className="w-3.5 h-3.5" />,
  TEXT: <FileText className="w-3.5 h-3.5" />,
  DOCUMENT: <FileText className="w-3.5 h-3.5" />,
  QUIZ: <HelpCircle className="w-3.5 h-3.5" />,
  LIVE: <Radio className="w-3.5 h-3.5" />,
};

// ─── Lesson Form State ────────────────────────────────────────────────────────

interface LessonDraft {
  title: string;
  type: LessonType;
  content: string;
  videoUrl: string;
  documentUrl: string; // ← ADD
  duration: string;
  isFree: boolean;
}

const emptyLesson = (): LessonDraft => ({
  title: "",
  type: "VIDEO",
  content: "",
  videoUrl: "",
  documentUrl: "",
  duration: "",
  isFree: false,
});

// ─── Component ────────────────────────────────────────────────────────────────

export default function SectionsManager({
  courseId,
  initialSections,
}: SectionsManagerProps) {
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>(initialSections);

  // Section-level state
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(initialSections.map((s) => s.id)),
  );
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState("");
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [addingSection, setAddingSection] = useState(false);
  const [savingSection, setSavingSection] = useState(false);

  // Lesson-level state
  const [addingLessonTo, setAddingLessonTo] = useState<string | null>(null); // sectionId
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [lessonDraft, setLessonDraft] = useState<LessonDraft>(emptyLesson());
  const [savingLesson, setSavingLesson] = useState(false);

  // ── Section helpers ──────────────────────────────────────────────────────

  const toggleSection = (id: string) =>
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const startAddSection = () => {
    setNewSectionTitle("");
    setAddingSection(true);
  };

  const cancelAddSection = () => {
    setAddingSection(false);
    setNewSectionTitle("");
  };

  const handleAddSection = async () => {
    if (!newSectionTitle.trim()) return;
    setSavingSection(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/sections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newSectionTitle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSections((prev) => [...prev, { ...data.section, lessons: [] }]);
      setExpandedSections((prev) => new Set([...prev, data.section.id]));
      setNewSectionTitle("");
      setAddingSection(false);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSavingSection(false);
    }
  };

  const startEditSection = (section: Section) => {
    setEditingSectionId(section.id);
    setEditingSectionTitle(section.title);
  };

  const cancelEditSection = () => {
    setEditingSectionId(null);
    setEditingSectionTitle("");
  };

  const handleSaveSection = async (sectionId: string) => {
    if (!editingSectionTitle.trim()) return;
    setSavingSection(true);
    try {
      const res = await fetch(
        `/api/courses/${courseId}/sections/${sectionId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: editingSectionTitle }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId ? { ...s, title: data.section.title } : s,
        ),
      );
      setEditingSectionId(null);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSavingSection(false);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (
      !confirm(
        `Delete "${section?.title}"? This will also delete all ${section?.lessons.length} lessons inside.`,
      )
    )
      return;

    try {
      const res = await fetch(
        `/api/courses/${courseId}/sections/${sectionId}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error("Failed to delete section");
      setSections((prev) => prev.filter((s) => s.id !== sectionId));
    } catch (e: any) {
      alert(e.message);
    }
  };

  // ── Lesson helpers ───────────────────────────────────────────────────────

  const startAddLesson = (sectionId: string) => {
    setEditingLessonId(null);
    setAddingLessonTo(sectionId);
    setLessonDraft(emptyLesson());
    // Make sure section is expanded
    setExpandedSections((prev) => new Set([...prev, sectionId]));
  };

  const startEditLesson = (lesson: Lesson) => {
    setAddingLessonTo(null);
    setEditingLessonId(lesson.id);
    setLessonDraft({
      title: lesson.title,
      type: lesson.type,
      content: lesson.content || "",
      videoUrl: lesson.videoUrl || "",
      documentUrl: lesson.documentUrl || "", // ← ADD
      duration: lesson.duration?.toString() || "",
      isFree: lesson.isFree,
    });
  };

  const cancelLesson = () => {
    setAddingLessonTo(null);
    setEditingLessonId(null);
    setLessonDraft(emptyLesson());
  };

  const handleSaveLesson = async (sectionId: string, lessonId?: string) => {
    if (!lessonDraft.title.trim()) return alert("Lesson title is required");
    setSavingLesson(true);

    const url = lessonId
      ? `/api/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`
      : `/api/courses/${courseId}/sections/${sectionId}/lessons`;

    const method = lessonId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lessonDraft),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSections((prev) =>
        prev.map((s) => {
          if (s.id !== sectionId) return s;
          if (lessonId) {
            return {
              ...s,
              lessons: s.lessons.map((l) =>
                l.id === lessonId ? { ...l, ...data.lesson } : l,
              ),
            };
          }
          return { ...s, lessons: [...s.lessons, data.lesson] };
        }),
      );

      cancelLesson();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSavingLesson(false);
    }
  };

  const handleDeleteLesson = async (
    sectionId: string,
    lessonId: string,
    lessonTitle: string,
  ) => {
    if (!confirm(`Delete lesson "${lessonTitle}"?`)) return;

    try {
      const res = await fetch(
        `/api/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error("Failed to delete lesson");
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId
            ? { ...s, lessons: s.lessons.filter((l) => l.id !== lessonId) }
            : s,
        ),
      );
    } catch (e: any) {
      alert(e.message);
    }
  };

  // ── Lesson form fields ───────────────────────────────────────────────────

  const renderLessonForm = (sectionId: string, lessonId?: string) => (
    <div className="mx-4 mb-3 glass rounded-xl p-5 border border-[var(--purple)]/20 space-y-4">
      <h4 className="text-sm font-semibold text-[var(--text-primary)]">
        {lessonId ? "Edit Lesson" : "New Lesson"}
      </h4>
      {/* Title */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-[var(--text-muted)]">
          Title <span className="text-[var(--scarlet)]">*</span>
        </label>
        <input
          type="text"
          value={lessonDraft.title}
          onChange={(e) =>
            setLessonDraft((d) => ({ ...d, title: e.target.value }))
          }
          placeholder="e.g. Introduction to budgeting"
          className="glass-input w-full px-3 py-2 text-sm"
          autoFocus
        />
      </div>
      {/* Type */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-[var(--text-muted)]">
          Lesson Type
        </label>
        <div className="flex gap-2 flex-wrap">
          {LESSON_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setLessonDraft((d) => ({ ...d, type: t.value }))}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                lessonDraft.type === t.value
                  ? TYPE_COLORS[t.value] + " ring-1 ring-current"
                  : "glass text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>
      {/* Video URL */}
      {lessonDraft.type === "VIDEO" && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--text-muted)]">
            Video URL
          </label>
          <input
            type="url"
            value={lessonDraft.videoUrl}
            onChange={(e) =>
              setLessonDraft((d) => ({ ...d, videoUrl: e.target.value }))
            }
            placeholder="https://..."
            className="glass-input w-full px-3 py-2 text-sm"
          />
        </div>
      )}
      {/* Text content */}
      {lessonDraft.type === "TEXT" && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--text-muted)]">
            Content
          </label>
          <textarea
            value={lessonDraft.content}
            onChange={(e) =>
              setLessonDraft((d) => ({ ...d, content: e.target.value }))
            }
            placeholder="Lesson content..."
            rows={5}
            className="glass-input w-full px-3 py-2 text-sm resize-none"
          />
        </div>
      )}
      // After the TEXT block:
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
        <div className="space-y-1 flex-1">
          <label className="text-xs font-medium text-[var(--text-muted)]">
            Duration (minutes)
          </label>
          <input
            type="number"
            value={lessonDraft.duration}
            onChange={(e) =>
              setLessonDraft((d) => ({ ...d, duration: e.target.value }))
            }
            placeholder="e.g. 15"
            min={1}
            className="glass-input w-full px-3 py-2 text-sm"
          />
        </div>

        <label className="flex items-center gap-2 pb-2 cursor-pointer">
          <div
            onClick={() => setLessonDraft((d) => ({ ...d, isFree: !d.isFree }))}
            className={`relative w-9 h-5 rounded-full transition-colors ${
              lessonDraft.isFree
                ? "bg-green-500"
                : "bg-[var(--glass-bg-strong)]"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                lessonDraft.isFree ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </div>
          <span className="text-xs font-medium text-[var(--text-secondary)]">
            Free preview
          </span>
        </label>
      </div>
      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={cancelLesson}
          className="flex items-center gap-1.5 px-4 py-2 text-xs rounded-lg glass text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Cancel
        </button>
        <button
          type="button"
          onClick={() => handleSaveLesson(sectionId, lessonId)}
          disabled={savingLesson}
          className="flex items-center gap-1.5 px-4 py-2 text-xs rounded-lg btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {savingLesson ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Check className="w-3.5 h-3.5" />
          )}
          {lessonId ? "Save Changes" : "Add Lesson"}
        </button>
      </div>
    </div>
  );

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Sections list */}
      {sections.length === 0 && !addingSection ? (
        <div className="glass rounded-xl p-12 text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-[var(--text-muted)]" />
          <h3 className="font-semibold text-[var(--text-primary)] mb-1">
            No sections yet
          </h3>
          <p className="text-sm text-[var(--text-muted)] mb-5">
            Add your first section to start building the course
          </p>
          <button
            type="button"
            onClick={startAddSection}
            className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Section
          </button>
        </div>
      ) : (
        sections.map((section, sIdx) => {
          const isExpanded = expandedSections.has(section.id);
          const isEditingThis = editingSectionId === section.id;
          const isAddingLessonHere = addingLessonTo === section.id;

          return (
            <div key={section.id} className="glass rounded-xl overflow-hidden">
              {/* Section header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--divider)] bg-[var(--glass-bg-strong)]">
                <GripVertical className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />

                <span className="text-xs font-mono text-[var(--text-muted)] w-5 flex-shrink-0">
                  {sIdx + 1}
                </span>

                {/* Title / edit input */}
                {isEditingThis ? (
                  <input
                    type="text"
                    value={editingSectionTitle}
                    onChange={(e) => setEditingSectionTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveSection(section.id);
                      if (e.key === "Escape") cancelEditSection();
                    }}
                    className="glass-input flex-1 px-3 py-1.5 text-sm"
                    autoFocus
                  />
                ) : (
                  <span
                    className="flex-1 text-sm font-semibold text-[var(--text-primary)] cursor-pointer"
                    onClick={() => toggleSection(section.id)}
                  >
                    {section.title}
                  </span>
                )}

                <span className="text-xs text-[var(--text-muted)] flex-shrink-0">
                  {section.lessons.length} lesson
                  {section.lessons.length !== 1 ? "s" : ""}
                </span>

                {/* Section actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {isEditingThis ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSaveSection(section.id)}
                        disabled={savingSection}
                        className="p-1.5 rounded-lg text-green-500 hover:bg-green-500/10 transition-colors"
                      >
                        {savingSection ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditSection}
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--glass-bg-subtle)] transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => startAddLesson(section.id)}
                        className="p-1.5 rounded-lg text-[var(--purple)] hover:bg-[var(--purple-faint)] transition-colors"
                        title="Add lesson"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => startEditSection(section)}
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--glass-bg-subtle)] transition-colors"
                        title="Rename section"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSection(section.id)}
                        className="p-1.5 rounded-lg text-[var(--scarlet)] hover:bg-[var(--scarlet-faint)] transition-colors"
                        title="Delete section"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleSection(section.id)}
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--glass-bg-subtle)] transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Lessons */}
              {isExpanded && (
                <div className="py-2">
                  {section.lessons.length === 0 && !isAddingLessonHere && (
                    <p className="px-12 py-4 text-xs text-[var(--text-muted)] text-center">
                      No lessons yet —{" "}
                      <button
                        type="button"
                        onClick={() => startAddLesson(section.id)}
                        className="text-[var(--purple)] hover:underline"
                      >
                        add one
                      </button>
                    </p>
                  )}

                  {section.lessons.map((lesson, lIdx) => {
                    const isEditingLesson = editingLessonId === lesson.id;

                    if (isEditingLesson) {
                      return (
                        <div key={lesson.id}>
                          {renderLessonForm(section.id, lesson.id)}
                        </div>
                      );
                    }

                    return (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--glass-bg-subtle)] transition-colors group"
                      >
                        <GripVertical className="w-3.5 h-3.5 text-[var(--text-muted)] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />

                        <span className="text-xs font-mono text-[var(--text-muted)] w-5 flex-shrink-0">
                          {lIdx + 1}
                        </span>

                        <span
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${TYPE_COLORS[lesson.type]}`}
                        >
                          {TYPE_ICONS[lesson.type]}
                          {lesson.type}
                        </span>

                        <span className="flex-1 text-sm text-[var(--text-primary)]">
                          {lesson.title}
                        </span>

                        {lesson.isFree && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 flex-shrink-0">
                            Preview
                          </span>
                        )}

                        {lesson.duration && (
                          <span className="text-xs text-[var(--text-muted)] flex-shrink-0">
                            {lesson.duration}m
                          </span>
                        )}

                        {/* Lesson actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => startEditLesson(lesson)}
                            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--glass-bg-subtle)] transition-colors"
                            title="Edit lesson"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteLesson(
                                section.id,
                                lesson.id,
                                lesson.title,
                              )
                            }
                            className="p-1.5 rounded-lg text-[var(--scarlet)] hover:bg-[var(--scarlet-faint)] transition-colors"
                            title="Delete lesson"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add lesson form inline */}
                  {isAddingLessonHere && renderLessonForm(section.id)}

                  {/* Add lesson button at bottom of section */}
                  {!isAddingLessonHere && (
                    <button
                      type="button"
                      onClick={() => startAddLesson(section.id)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 text-xs text-[var(--text-muted)] hover:text-[var(--purple)] hover:bg-[var(--purple-faint)] transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Lesson
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}

      {/* New section form */}
      {addingSection && (
        <div className="glass rounded-xl p-4 border border-[var(--purple)]/20">
          <p className="text-xs font-medium text-[var(--text-muted)] mb-2">
            Section {sections.length + 1}
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddSection();
                if (e.key === "Escape") cancelAddSection();
              }}
              placeholder="Section title, e.g. Getting Started"
              className="glass-input flex-1 px-4 py-2.5 text-sm"
              autoFocus
            />
            <button
              type="button"
              onClick={cancelAddSection}
              className="p-2.5 rounded-xl glass text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleAddSection}
              disabled={savingSection || !newSectionTitle.trim()}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl btn-primary text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {savingSection ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Add
            </button>
          </div>
        </div>
      )}

      {/* Add section button */}
      {!addingSection && sections.length > 0 && (
        <button
          type="button"
          onClick={startAddSection}
          className="w-full glass rounded-xl py-3.5 flex items-center justify-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--purple)] hover:border-[var(--purple)]/30 border border-dashed border-[var(--divider)] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Section
        </button>
      )}
    </div>
  );
}
