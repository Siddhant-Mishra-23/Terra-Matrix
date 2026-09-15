"use client";

import ImageUpload from "@/components/Admin/ImageUpload";
import {
  completedTrainings as fallbackCompleted,
  upcomingTrainings as fallbackUpcoming,
} from "@/components/Trainings/trainingsData";
import { deleteStorageFileIfUploaded } from "@/lib/storage-cleanup";
import { createClient } from "@/lib/supabase/client";
import { Training } from "@/types/training";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function AdminTrainingsPage() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncingDefaults, setSyncingDefaults] = useState(false);
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed">("all");
  const [search, setSearch] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Geospatial Intelligence",
    date: "",
    duration: "",
    mode: "Online" as "Online" | "In-Person" | "Hybrid",
    status: "upcoming" as "upcoming" | "completed",
    image: "/images/about/geospatial.svg",
    highlights: "",
    attendees: "",
    link: "/contact",
    is_paid: false,
    price: "Free",
    upi_id: "terramatrix@upi",
    qr_image: "",
  });

  const notifySuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const fetchTrainings = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("trainings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching trainings:", error);
      } else if (data && data.length > 0) {
        setTrainings(data as Training[]);
      } else {
        setTrainings([...fallbackUpcoming, ...fallbackCompleted]);
      }
    } catch (err) {
      console.error("Fetch trainings error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchTrainings();
    notifySuccess("Trainings refreshed from database!");
  };

  const handleSeedDefaultTrainings = async () => {
    if (!confirm("This will seed initial training sessions into your database. Continue?")) return;
    setSyncingDefaults(true);
    const supabase = createClient();

    const allDefaults = [...fallbackUpcoming, ...fallbackCompleted].map((t) => ({
      title: t.title,
      description: t.description,
      category: t.category,
      date: t.date,
      duration: t.duration,
      mode: t.mode,
      status: t.status,
      image: t.image,
      highlights: t.highlights,
      attendees: t.attendees || null,
      link: t.link || "/contact",
      is_paid: false,
      price: "Free",
      upi_id: "terramatrix@upi",
      updated_at: new Date().toISOString(),
    }));

    try {
      const { error } = await supabase.from("trainings").insert(allDefaults);
      if (error) throw error;
      notifySuccess("Successfully seeded default trainings to database!");
      await fetchTrainings();
    } catch (err: any) {
      console.error("Seed trainings error:", err);
      alert("Failed to seed trainings: " + (err.message || "Unknown error"));
    } finally {
      setSyncingDefaults(false);
    }
  };

  const openCreateModal = () => {
    setEditingTraining(null);
    setFormData({
      title: "",
      description: "",
      category: "Geospatial Intelligence",
      date: "",
      duration: "",
      mode: "Online",
      status: "upcoming",
      image: "/images/about/geospatial.svg",
      highlights: "",
      attendees: "",
      link: "/contact",
      is_paid: false,
      price: "Free",
      upi_id: "terramatrix@upi",
      qr_image: "",
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: Training) => {
    setEditingTraining(item);
    setFormData({
      title: item.title,
      description: item.description,
      category: item.category,
      date: item.date,
      duration: item.duration,
      mode: item.mode,
      status: item.status,
      image: item.image,
      highlights: (item.highlights || []).join("\n"),
      attendees: item.attendees || "",
      link: item.link || "/contact",
      is_paid: item.is_paid || false,
      price: item.price || "Free",
      upi_id: item.upi_id || "terramatrix@upi",
      qr_image: item.qr_image || "",
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    const supabase = createClient();
    const highlightsArray = formData.highlights
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      date: formData.date,
      duration: formData.duration,
      mode: formData.mode,
      status: formData.status,
      image: formData.image,
      highlights: highlightsArray,
      attendees: formData.attendees || null,
      link: formData.link,
      is_paid: formData.is_paid,
      price: formData.is_paid ? formData.price : "Free",
      upi_id: formData.upi_id,
      qr_image: formData.qr_image,
      updated_at: new Date().toISOString(),
    };

    try {
      const isExistingUuid = editingTraining && typeof editingTraining.id === "string" && editingTraining.id.includes("-");

      if (isExistingUuid) {
        const { error } = await supabase
          .from("trainings")
          .update(payload)
          .eq("id", editingTraining.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("trainings").insert([payload]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      await fetchTrainings();
      notifySuccess(`Training session "${formData.title}" saved successfully!`);
    } catch (err: any) {
      console.error("Save error:", err);
      setErrorMsg(err.message || "Failed to save training.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm("Are you sure you want to delete this training? This cannot be undone.")) {
      return;
    }

    const itemToDelete = trainings.find((t) => t.id === id);
    const supabase = createClient();
    try {
      if (typeof id === "string" && id.includes("-")) {
        const { error } = await supabase.from("trainings").delete().eq("id", id);
        if (error) throw error;
      }
      if (itemToDelete?.image) {
        await deleteStorageFileIfUploaded(itemToDelete.image);
      }
      setTrainings((prev) => prev.filter((t) => t.id !== id));
      notifySuccess("Training deleted successfully!");
    } catch (err: any) {
      alert("Error deleting training: " + (err.message || "Failed to delete"));
    }
  };

  const handleToggleStatus = async (item: Training) => {
    const newStatus = item.status === "upcoming" ? "completed" : "upcoming";
    const supabase = createClient();
    try {
      if (typeof item.id === "string" && item.id.includes("-")) {
        const { error } = await supabase
          .from("trainings")
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq("id", item.id);

        if (error) throw error;
      }
      setTrainings((prev) =>
        prev.map((t) => (t.id === item.id ? { ...t, status: newStatus } : t))
      );
      notifySuccess(`Status changed to ${newStatus}!`);
    } catch (err: any) {
      alert("Failed to toggle status: " + err.message);
    }
  };

  // Filtering
  const filteredTrainings = trainings.filter((item) => {
    const matchesFilter = filter === "all" ? true : item.status === filter;
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
            Trainings Management
          </h2>
          <p className="text-xs text-body-color">
            Manage upcoming & completed workshops, syllabus, Free/Paid pricing, and UPI QR verification ({trainings.length} total).
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
            Add New Training
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between shadow-one">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
              filter === "all"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All ({trainings.length})
          </button>
          <button
            onClick={() => setFilter("upcoming")}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
              filter === "upcoming"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Upcoming ({trainings.filter((t) => t.status === "upcoming").length})
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
              filter === "completed"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Completed ({trainings.filter((t) => t.status === "completed").length})
          </button>
        </div>

        <div className="w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-dark focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-64"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-one">
        {loading ? (
          <div className="p-12 text-center text-sm text-body-color">
            <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Loading trainings...
          </div>
        ) : filteredTrainings.length === 0 ? (
          <div className="p-12 text-center text-sm text-body-color space-y-3">
            <p>No training sessions found.</p>
            <button
              onClick={handleSeedDefaultTrainings}
              disabled={syncingDefaults}
              className="inline-flex items-center gap-2 rounded-lg bg-primary/10 border border-primary px-4 py-2 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition"
            >
              {syncingDefaults ? "Seeding..." : "Seed Default Trainings to Database"}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="border-b border-gray-200 bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-3.5">Training Title</th>
                  <th className="px-6 py-3.5">Category & Pricing</th>
                  <th className="px-6 py-3.5">Schedule</th>
                  <th className="px-6 py-3.5">Mode</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTrainings.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100 p-1 border border-gray-200">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            sizes="40px"
                            className="object-contain p-1"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-dark text-sm">{item.title}</p>
                          <p className="line-clamp-1 text-[11px] text-body-color max-w-sm">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="rounded bg-primary/10 px-2 py-0.5 font-medium text-primary text-[10px]">
                          {item.category}
                        </span>
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                            item.is_paid
                              ? "bg-purple-100 text-purple-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {item.is_paid ? `Paid: ${item.price || "₹499"}` : "Free Session"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-dark">{item.date}</p>
                      <p className="text-[11px] text-body-color">{item.duration}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-dark font-medium">
                        {item.mode}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold transition ${
                          item.status === "upcoming"
                            ? "bg-yellow/15 text-yellow hover:bg-yellow/25"
                            : "bg-green/15 text-green hover:bg-green/25"
                        }`}
                        title="Click to toggle status"
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            item.status === "upcoming" ? "bg-yellow" : "bg-green"
                          }`}
                        />
                        {item.status === "upcoming" ? "Upcoming" : "Completed"}
                      </button>
                    </td>
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
                  {editingTraining ? "Edit Training Session" : "Create New Training"}
                </h3>
                <p className="text-xs text-body-color">
                  Configure training curriculum, syllabus, and Free/Paid pricing controls.
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
                <label className="mb-1 block font-semibold text-dark">Training Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Advanced GIS & Remote Sensing"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-dark">Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detailed syllabus overview..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                />
              </div>

              {/* Pricing & Paid / Free Option */}
              <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-dark text-xs uppercase tracking-wider">
                    Session Pricing Model
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="is_paid"
                        checked={!formData.is_paid}
                        onChange={() => setFormData({ ...formData, is_paid: false, price: "Free" })}
                        className="text-primary"
                      />
                      <span className="font-semibold text-dark">Free Session</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="is_paid"
                        checked={formData.is_paid}
                        onChange={() => setFormData({ ...formData, is_paid: true, price: "₹499" })}
                        className="text-primary"
                      />
                      <span className="font-semibold text-dark">Paid Session</span>
                    </label>
                  </div>
                </div>

                {formData.is_paid && (
                  <div className="space-y-4 pt-3 border-t border-gray-200">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block font-semibold text-dark">Registration Fee / Price *</label>
                        <input
                          type="text"
                          placeholder="e.g. ₹499 or ₹1,499"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-dark focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block font-semibold text-dark">Official UPI ID for Payments</label>
                        <input
                          type="text"
                          placeholder="terramatrix@upi"
                          value={formData.upi_id}
                          onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                          className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-dark focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* QR Code Upload Section */}
                    <div className="rounded-xl border border-dashed border-primary/30 bg-white p-3.5 shadow-xs">
                      <ImageUpload
                        label="Upload UPI Payment QR Code Image (Scanner)"
                        value={formData.qr_image || ""}
                        onChange={(url) => setFormData({ ...formData, qr_image: url })}
                        folder="payment_qrs"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-semibold text-dark">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                  >
                    <option value="Geospatial Intelligence">Geospatial Intelligence</option>
                    <option value="AI & Data Science">AI & Data Science</option>
                    <option value="Surveying & UAV">Surveying & UAV</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Water Resources">Water Resources</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-dark">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as "upcoming" | "completed",
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block font-semibold text-dark">Date / Batch Info *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Batch Starting Soon"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-dark">Duration *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 4 Weeks"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-dark">Mode</label>
                  <select
                    value={formData.mode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mode: e.target.value as "Online" | "In-Person" | "Hybrid",
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                  >
                    <option value="Online">Online</option>
                    <option value="In-Person">In-Person</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              {/* Image Upload */}
              <ImageUpload
                label="Training Banner / Icon"
                value={formData.image}
                onChange={(url) => setFormData({ ...formData, image: url })}
                bucket="media"
                folder="trainings"
              />

              <div>
                <label className="mb-1 block font-semibold text-dark">
                  Key Curriculum Highlights (One item per line)
                </label>
                <textarea
                  rows={3}
                  placeholder={"Satellite Imagery Processing\nDigital Elevation Models (DEM)\nSpatial Network Optimization"}
                  value={formData.highlights}
                  onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-semibold text-dark">
                    Attendees (For Completed Sessions)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 65+ Engineers Trained"
                    value={formData.attendees}
                    onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-dark">Registration Link (href)</label>
                  <input
                    type="text"
                    placeholder="/contact"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
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
                  {saving ? "Saving..." : editingTraining ? "Update Training" : "Create Training"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
