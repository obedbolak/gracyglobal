"use client";

import { use, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Loader2, Plus, Trash2 } from "lucide-react";

interface CourseForm {
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  level: string;
  price: number;
  isFree: boolean;
  published: boolean;
  featured: boolean;
}

export default function AdminCourseEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CourseForm>({
    title: "",
    description: "",
    thumbnail: "",
    category: "",
    level: "BEGINNER",
    price: 0,
    isFree: true,
    published: false,
    featured: false,
  });

  const isNew = id === "new";

  useEffect(() => {
    if (session?.user?.role && !session.user.role.includes("ADMIN")) {
      router.push("/dashboard");
      return;
    }
    if (!isNew) {
      fetchCourse();
    } else {
      setLoading(false);
    }
  }, [session, id]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${id}`);
      const data = await response.json();
      if (data.success) {
        setForm(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch course:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = isNew ? "/api/courses" : `/api/courses/${id}`;
      const method = isNew ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (data.success) {
        router.push("/admin/courses");
      }
    } catch (error) {
      console.error("Failed to save course:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isNew ? "Create Course" : "Edit Course"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isNew
              ? "Add a new course to the platform"
              : "Update course details"}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="p-6 mb-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Title
                </label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Introduction to Web Development"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Course description..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <Input
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    placeholder="Technology"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Level
                  </label>
                  <select
                    value={form.level}
                    onChange={(e) =>
                      setForm({ ...form, level: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thumbnail URL
                </label>
                <Input
                  value={form.thumbnail}
                  onChange={(e) =>
                    setForm({ ...form, thumbnail: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.isFree}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        isFree: e.target.checked,
                        price: e.target.checked ? 0 : form.price,
                      })
                    }
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Free Course
                  </span>
                </label>

                {!form.isFree && (
                  <div className="flex-1">
                    <Input
                      type="number"
                      value={form.price}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          price: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="Price in CFA"
                      min="0"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) =>
                      setForm({ ...form, published: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Published
                  </span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) =>
                      setForm({ ...form, featured: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Featured
                  </span>
                </label>
              </div>
            </div>
          </Card>

          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/courses")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isNew ? "Create Course" : "Save Changes"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
