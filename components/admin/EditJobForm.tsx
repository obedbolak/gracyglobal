// components/admin/EditJobForm.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/shared/ImageUpload";
import { ArrowLeft, Save, Trash2, Plus, X } from "lucide-react";
import Link from "next/link";
import { Job, JobCategory, JobType } from "@prisma/client";

const jobCategories: JobCategory[] = [
  "TECH",
  "MARKETING",
  "DESIGN",
  "CUSTOMER_SERVICE",
  "WRITING",
  "FINANCE",
  "EDUCATION",
  "HEALTH",
  "OTHER",
];

const jobTypes: JobType[] = ["REMOTE", "HYBRID", "CONTRACT", "FREELANCE"];

interface EditJobFormProps {
  job: Job;
}

export default function EditJobForm({ job }: EditJobFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    title: job.title,
    company: job.company,
    description: job.description,
    category: job.category as JobCategory,
    type: job.type as JobType,
    salaryMin: job.salaryMin?.toString() || "",
    salaryMax: job.salaryMax?.toString() || "",
    location: job.location || "",
    skills: job.skills.length > 0 ? job.skills : [""],
    active: job.active,
    featured: job.featured,
    expiresAt: job.expiresAt
      ? new Date(job.expiresAt).toISOString().split("T")[0]
      : "",
  });

  const [companyLogo, setCompanyLogo] = useState(job.companyLogo || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          company: formData.company,
          description: formData.description,
          category: formData.category,
          type: formData.type,
          companyLogo,
          salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : null,
          salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : null,
          location: formData.location || null,
          skills: formData.skills.filter((s) => s.trim()),
          active: formData.active,
          featured: formData.featured,
          expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : null,
        }),
      });

      if (!response.ok) throw new Error("Failed to update job");

      router.push("/admin/jobs");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to update job");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    setDeleting(true);

    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete job");

      router.push("/admin/jobs");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to delete job");
      setDeleting(false);
    }
  };

  const addSkill = () => {
    setFormData({ ...formData, skills: [...formData.skills, ""] });
  };

  const updateSkill = (index: number, value: string) => {
    const updated = [...formData.skills];
    updated[index] = value;
    setFormData({ ...formData, skills: updated });
  };

  const removeSkill = (index: number) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/jobs"
            className="p-2 hover:bg-[var(--glass-bg-hover)] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">
              Edit Job
            </h1>
            <p className="text-[var(--text-muted)] mt-1">
              Update job listing information
            </p>
          </div>
        </div>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--error-bg)] text-[var(--error-text)] hover:bg-[var(--error-border)]"
        >
          <Trash2 className="w-4 h-4" />
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Logo */}
        <div className="glass p-6 rounded-xl">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Company Logo
          </h2>
          <ImageUpload
            folder="jobs/logos"
            aspectRatio="square"
            currentImage={companyLogo}
            onUploadComplete={(url) => setCompanyLogo(url)}
          />
        </div>

        {/* Basic Info */}
        <div className="glass p-6 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Job Details
          </h2>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Job Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="glass-input w-full px-4 py-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Company Name *
            </label>
            <input
              type="text"
              required
              value={formData.company}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
              className="glass-input w-full px-4 py-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Job Description *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={6}
              className="glass-input w-full px-4 py-3 resize-none"
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
                  setFormData({
                    ...formData,
                    category: e.target.value as JobCategory,
                  })
                }
                className="glass-input w-full px-4 py-3"
              >
                <option value="">Select category</option>
                {jobCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Job Type *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as JobType })
                }
                className="glass-input w-full px-4 py-3"
              >
                {jobTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Salary Min (XAF)
              </label>
              <input
                type="number"
                min="0"
                value={formData.salaryMin}
                onChange={(e) =>
                  setFormData({ ...formData, salaryMin: e.target.value })
                }
                className="glass-input w-full px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Salary Max (XAF)
              </label>
              <input
                type="number"
                min="0"
                value={formData.salaryMax}
                onChange={(e) =>
                  setFormData({ ...formData, salaryMax: e.target.value })
                }
                className="glass-input w-full px-4 py-3"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className="glass-input w-full px-4 py-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Expires At
            </label>
            <input
              type="date"
              value={formData.expiresAt}
              onChange={(e) =>
                setFormData({ ...formData, expiresAt: e.target.value })
              }
              className="glass-input w-full px-4 py-3"
            />
          </div>
        </div>

        {/* Skills */}
        <div className="glass p-6 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Required Skills
          </h2>
          {formData.skills.map((skill, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={skill}
                onChange={(e) => updateSkill(index, e.target.value)}
                className="glass-input flex-1 px-4 py-3"
              />
              {formData.skills.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="p-3 bg-[var(--error-bg)] text-[var(--error-text)] rounded-lg hover:bg-[var(--error-border)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addSkill}
            className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-lg"
          >
            <Plus className="w-4 h-4" />
            Add Skill
          </button>
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
            <span className="text-[var(--text-secondary)] font-medium">
              Featured Job
            </span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) =>
                setFormData({ ...formData, active: e.target.checked })
              }
              className="w-5 h-5 rounded border-[var(--input-border)] text-[var(--purple)] focus:ring-[var(--purple)]"
            />
            <span className="text-[var(--text-secondary)] font-medium">
              Active
            </span>
          </label>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center gap-2 px-6 py-3 rounded-lg disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {loading ? "Updating..." : "Update Job"}
          </button>
          <Link
            href="/admin/jobs"
            className="btn-secondary px-6 py-3 rounded-lg"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
