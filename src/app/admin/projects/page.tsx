"use client";

import ImageUpload from "@/components/Admin/ImageUpload";
import fallbackProjectData from "@/components/Project/projectData";
import { deleteStorageFileIfUploaded } from "@/lib/storage-cleanup";
import { createClient } from "@/lib/supabase/client";
import { Project } from "@/types/project";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncingDefaults, setSyncingDefaults] = useState(false);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    paragraph: "",
    image: "/images/project/Project-01.png",
    authorName: "Terra Matrix",
    authorDesignation: "Engineering & Analytics Team",
    authorImage: "/images/favicon.png",
    tags: "Infrastructure, Geospatial",
    publishDate: "2026",
    href: "/project",
  });

  const notifySuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching projects:", error);
      } else if (data && data.length > 0) {
        const mapped = data.map((d: any) => ({
          id: d.id,
          title: d.title,
          paragraph: d.paragraph,
          image: d.image,
          author: {
            name: d.author_name || "Terra Matrix",
            image: d.author_image || "/images/favicon.png",
            designation: d.author_designation || "Engineering Team",
          },
          tags: d.tags || ["Infrastructure"],
          publishDate: d.publish_date || "2026",
          href: d.href || "/project",
        }));
        setProjects(mapped);
      } else {
        setProjects(fallbackProjectData);
      }
    } catch (err) {
      console.error("Fetch projects error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchProjects();
    notifySuccess("Projects refreshed from database!");
  };

  const handleSeedDefaultProjects = async () => {
    if (!confirm("This will seed default initial projects into your database. Continue?")) return;
    setSyncingDefaults(true);
    const supabase = createClient();

    const payload = fallbackProjectData.map((p) => ({
      title: p.title,
      paragraph: p.paragraph,
      image: p.image,
      author_name: p.author.name,
      author_designation: p.author.designation,
      author_image: p.author.image,
      tags: p.tags,
      publish_date: p.publishDate,
      href: p.href,
      updated_at: new Date().toISOString(),
    }));

    try {
      const { error } = await supabase.from("projects").insert(payload);
      if (error) throw error;
      notifySuccess("Successfully seeded default projects to database!");
      await fetchProjects();
    } catch (err: any) {
      console.error("Seed projects error:", err);
      alert("Failed to seed projects: " + (err.message || "Unknown error"));
    } finally {
      setSyncingDefaults(false);
    }
  };

  const openCreateModal = () => {
    setEditingProject(null);
    setFormData({
      title: "",
      paragraph: "",
      image: "/images/project/Project-01.png",
      authorName: "Terra Matrix",
      authorDesignation: "Engineering & Analytics Team",
      authorImage: "/images/favicon.png",
      tags: "Infrastructure, Geospatial",
      publishDate: "2026",
      href: "/project",
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: Project) => {
    setEditingProject(item);
    setFormData({
      title: item.title,
      paragraph: item.paragraph,
      image: item.image,
      authorName: item.author.name,
      authorDesignation: item.author.designation,
      authorImage: item.author.image,
      tags: (item.tags || []).join(", "),
      publishDate: item.publishDate,
      href: item.href,
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    const supabase = createClient();
    const tagsArray = formData.tags
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      title: formData.title,
      paragraph: formData.paragraph,
      image: formData.image,
      author_name: formData.authorName,
      author_designation: formData.authorDesignation,
      author_image: formData.authorImage,
      tags: tagsArray,
      publish_date: formData.publishDate,
      href: formData.href,
      updated_at: new Date().toISOString(),
    };

    try {
      const isExistingUuid = editingProject && typeof editingProject.id === "string" && editingProject.id.includes("-");

      if (isExistingUuid) {
        const { error } = await supabase
          .from("projects")
          .update(payload)
          .eq("id", editingProject.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("projects").insert([payload]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      await fetchProjects();
      notifySuccess(`Project "${formData.title}" saved successfully!`);
    } catch (err: any) {
      console.error("Save error:", err);
      setErrorMsg(err.message || "Failed to save project.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    const itemToDelete = projects.find((p) => p.id === id);
    const supabase = createClient();
    try {
      if (typeof id === "string" && id.includes("-")) {
        const { error } = await supabase.from("projects").delete().eq("id", id);
        if (error) throw error;
      }
      if (itemToDelete?.image) {
        await deleteStorageFileIfUploaded(itemToDelete.image);
      }
      setProjects((prev) => prev.filter((p) => p.id !== id));
      notifySuccess("Project deleted successfully!");
    } catch (err: any) {
      alert("Error deleting project: " + (err.message || "Failed to delete"));
    }
  };

  const filteredProjects = projects.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-xs font-semibold text-green-800 shadow-sm transition animate-in fade-in">
          <svg className="h-4 w-4 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{successMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-dark sm:text-2xl">
            Projects Management
          </h2>
          <p className="text-xs text-body-color">
            Create, update, and manage your engineering & geospatial project portfolio ({projects.length} total).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleManualRefresh}
            disabled={refreshing || loading}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 cursor-pointer disabled:opacity-50"
            title="Refresh from database"
          >
            <svg
              className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-primary" : "text-gray-500"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-green px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Project
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex rounded-xl border border-gray-200 bg-white p-4 shadow-one">
        <input
          type="text"
          placeholder="Search projects by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-lg border border-gray-300 px-3 py-2 text-xs text-dark focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-one">
        {loading ? (
          <div className="p-12 text-center text-sm text-body-color">
            <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Loading projects...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-12 text-center text-sm text-body-color space-y-3">
            <p>No projects found.</p>
            <button
              onClick={handleSeedDefaultProjects}
              disabled={syncingDefaults}
              className="inline-flex items-center gap-2 rounded-lg bg-primary/10 border border-primary px-4 py-2 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition"
            >
              {syncingDefaults ? "Seeding..." : "Seed Default Projects to Database"}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="border-b border-gray-200 bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-3.5">Project</th>
                  <th className="px-6 py-3.5">Category Tags</th>
                  <th className="px-6 py-3.5">Author</th>
                  <th className="px-6 py-3.5">Year</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProjects.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100 border border-gray-200">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-dark text-sm">{item.title}</p>
                          <p className="line-clamp-1 text-[11px] text-body-color max-w-sm">
                            {item.paragraph}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {item.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="rounded bg-primary/10 px-2 py-0.5 font-medium text-primary text-[10px]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-dark">{item.author.name}</p>
                      <p className="text-[11px] text-body-color">{item.author.designation}</p>
                    </td>
                    <td className="px-6 py-4 font-medium text-dark">{item.publishDate}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-dark transition"
                          title="Edit"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="rounded p-1.5 text-red-500 hover:bg-red-50 transition"
                          title="Delete"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 sm:p-8 shadow-two">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-dark">
                  {editingProject ? "Edit Project" : "Add New Project"}
                </h3>
                <p className="text-xs text-body-color">
                  Configure project showcase properties saved to Supabase.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-dark text-xl leading-none"
              >
                &times;
              </button>
            </div>

            {errorMsg && (
              <div className="mb-6 rounded-lg bg-red-50 p-3.5 text-xs text-red-600">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="mb-1 block font-semibold text-dark">Project Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Groundwater Forecast & Sensor Network"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-dark">Short Paragraph / Abstract *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Brief summary of the engineering work..."
                  value={formData.paragraph}
                  onChange={(e) => setFormData({ ...formData, paragraph: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                />
              </div>

              {/* Image Upload */}
              <ImageUpload
                label="Project Main Image"
                value={formData.image}
                onChange={(url) => setFormData({ ...formData, image: url })}
                bucket="media"
                folder="projects"
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-semibold text-dark">Author / Division Name</label>
                  <input
                    type="text"
                    value={formData.authorName}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-dark">Author Designation</label>
                  <input
                    type="text"
                    value={formData.authorDesignation}
                    onChange={(e) =>
                      setFormData({ ...formData, authorDesignation: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block font-semibold text-dark">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="Groundwater, AI, Infrastructure"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-dark">Publish Year / Date</label>
                  <input
                    type="text"
                    placeholder="2026"
                    value={formData.publishDate}
                    onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-dark">Target Link (href)</label>
                  <input
                    type="text"
                    placeholder="/project-details/groundwater-forecast"
                    value={formData.href}
                    onChange={(e) => setFormData({ ...formData, href: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-green px-5 py-2 font-semibold text-white hover:bg-primary disabled:opacity-50"
                >
                  {saving ? "Saving to Supabase..." : editingProject ? "Update Project" : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
