"use client";

import ImageUpload from "@/components/Admin/ImageUpload";
import { deleteStorageFileIfUploaded } from "@/lib/storage-cleanup";
import { createClient } from "@/lib/supabase/client";
import { Conference } from "@/types/conference";
import Image from "next/image";
import { useEffect, useState } from "react";

const fallbackConferences: Conference[] = [
  {
    id: "1",
    title: "National Symposium on AI Applications in Civil & Geospatial Infrastructure 2026",
    description:
      "A flagship conference bringing together leading academicians, industry experts, and government stakeholders to discuss emerging AI paradigms in smart infrastructure.",
    venue: "Bhubaneswar / Hybrid",
    date: "November 14-15, 2026",
    category: "National Conference",
    image: "/images/about/innovation.svg",
    status: "upcoming",
    registration_link: "/contact",
    is_paid: false,
    price: "Free",
    highlights: [
      "Keynotes by AI & Civil Engineering Pioneers",
      "Peer-Reviewed Paper Presentations",
      "Industry Tech Demonstrations & Networking",
      "Proceedings Published with ISBN / DOI Indexing",
    ],
  },
  {
    id: "2",
    title: "International Workshop on Remote Sensing for Water Resource Resilience",
    description:
      "An interactive symposium on climate adaptation, hydrological modeling, and satellite data analytics for water security.",
    venue: "Online Virtual Summit",
    date: "December 05, 2026",
    category: "International Workshop",
    image: "/images/about/geospatial.svg",
    status: "upcoming",
    registration_link: "/contact",
    is_paid: false,
    price: "Free",
    highlights: [
      "Global Case Studies from 10+ Countries",
      "Hands-on Technical Demonstration",
      "Policy & Governance Panel Discussions",
    ],
  },
];

export default function AdminConferencesPage() {
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncingDefaults, setSyncingDefaults] = useState(false);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Conference | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    venue: "Bhubaneswar / Hybrid",
    date: "",
    category: "Technical Symposium",
    image: "/images/about/innovation.svg",
    status: "upcoming" as "upcoming" | "completed",
    registration_link: "/contact",
    is_paid: false,
    price: "Free",
    upi_id: "terramatrix@upi",
    qr_image: "",
    highlights: "",
  });

  const notifySuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const fetchConferences = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("conferences")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching conferences:", error);
      } else if (data && data.length > 0) {
        setConferences(data as Conference[]);
      } else {
        setConferences(fallbackConferences);
      }
    } catch (err) {
      console.error("Fetch conferences error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchConferences();
  }, []);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchConferences();
    notifySuccess("Conferences refreshed from database!");
  };

  const handleSeedDefaultConferences = async () => {
    if (!confirm("This will seed default conferences into your database. Continue?")) return;
    setSyncingDefaults(true);
    const supabase = createClient();

    const payload = fallbackConferences.map((c) => ({
      title: c.title,
      description: c.description,
      venue: c.venue,
      date: c.date,
      category: c.category,
      image: c.image,
      status: c.status,
      registration_link: c.registration_link || "/contact",
      is_paid: false,
      price: "Free",
      upi_id: "terramatrix@upi",
      highlights: c.highlights || [],
      updated_at: new Date().toISOString(),
    }));

    try {
      const { error } = await supabase.from("conferences").insert(payload);
      if (error) throw error;
      notifySuccess("Successfully seeded default conferences to database!");
      await fetchConferences();
    } catch (err: any) {
      console.error("Seed conferences error:", err);
      alert("Failed to seed conferences: " + (err.message || "Unknown error"));
    } finally {
      setSyncingDefaults(false);
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      title: "",
      description: "",
      venue: "Bhubaneswar / Hybrid",
      date: "",
      category: "Technical Symposium",
      image: "/images/about/innovation.svg",
      status: "upcoming",
      registration_link: "/contact",
      is_paid: false,
      price: "Free",
      upi_id: "terramatrix@upi",
      qr_image: "",
      highlights: "",
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: Conference) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      venue: item.venue,
      date: item.date,
      category: item.category,
      image: item.image,
      status: item.status,
      registration_link: item.registration_link || "/contact",
      is_paid: item.is_paid || false,
      price: item.price || "Free",
      upi_id: item.upi_id || "terramatrix@upi",
      qr_image: item.qr_image || "",
      highlights: (item.highlights || []).join("\n"),
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
      venue: formData.venue,
      date: formData.date,
      category: formData.category,
      image: formData.image,
      status: formData.status,
      registration_link: formData.registration_link || "/contact",
      is_paid: formData.is_paid,
      price: formData.is_paid ? formData.price : "Free",
      upi_id: formData.upi_id,
      qr_image: formData.qr_image,
      highlights: highlightsArray,
      updated_at: new Date().toISOString(),
    };

    try {
      const isExistingUuid = editingItem && typeof editingItem.id === "string" && editingItem.id.includes("-");

      if (isExistingUuid) {
        const { error } = await supabase
          .from("conferences")
          .update(payload)
          .eq("id", editingItem.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("conferences").insert([payload]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      await fetchConferences();
      notifySuccess(`Conference "${formData.title}" saved successfully!`);
    } catch (err: any) {
      console.error("Save error:", err);
      setErrorMsg(err.message || "Failed to save conference.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this conference?")) return;

    const itemToDelete = conferences.find((c) => c.id === id);
    const supabase = createClient();
    try {
      if (typeof id === "string" && id.includes("-")) {
        const { error } = await supabase.from("conferences").delete().eq("id", id);
        if (error) throw error;
      }
      if (itemToDelete?.image) {
        await deleteStorageFileIfUploaded(itemToDelete.image);
      }
      setConferences((prev) => prev.filter((c) => c.id !== id));
      notifySuccess("Conference deleted successfully!");
    } catch (err: any) {
      alert("Error deleting conference: " + (err.message || "Failed to delete"));
    }
  };

  const filtered = conferences.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase()) ||
    item.venue.toLowerCase().includes(search.toLowerCase())
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
            Conferences & Symposiums
          </h2>
          <p className="text-xs text-body-color">
            Publish symposiums, Free/Paid delegate passes, and manage paper submission portals ({conferences.length} total).
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
            Add New Conference
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex rounded-xl border border-gray-200 bg-white p-4 shadow-one">
        <input
          type="text"
          placeholder="Search by title, venue, category..."
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
            Loading conferences from Supabase...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-body-color space-y-3">
            <p>No conferences found.</p>
            <button
              onClick={handleSeedDefaultConferences}
              disabled={syncingDefaults}
              className="inline-flex items-center gap-2 rounded-lg bg-primary/10 border border-primary px-4 py-2 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition"
            >
              {syncingDefaults ? "Seeding..." : "Seed Default Conferences to Database"}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="border-b border-gray-200 bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-3.5">Title & Topic</th>
                  <th className="px-6 py-3.5">Venue & Category</th>
                  <th className="px-6 py-3.5">Pricing</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100 p-1 border border-gray-200">
                          <Image
                            src={item.image || "/images/about/innovation.svg"}
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
                      <p className="font-medium text-dark">{item.venue}</p>
                      <span className="rounded bg-primary/10 px-2 py-0.5 font-medium text-primary text-[10px]">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          item.is_paid ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"
                        }`}
                      >
                        {item.is_paid ? `Paid: ${item.price || "₹999"}` : "Free Pass"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-dark">{item.date}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                          item.status === "upcoming"
                            ? "bg-yellow/15 text-yellow"
                            : "bg-green/15 text-green"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            item.status === "upcoming" ? "bg-yellow" : "bg-green"
                          }`}
                        />
                        {item.status === "upcoming" ? "Upcoming" : "Completed"}
                      </span>
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
                  {editingItem ? "Edit Conference" : "Add New Conference"}
                </h3>
                <p className="text-xs text-body-color">
                  Publish conference details and Free/Paid delegate settings.
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
                <label className="mb-1 block font-semibold text-dark">Conference Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. National Symposium on AI in Civil Infrastructure"
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
                  placeholder="Conference scope, themes, and participation details..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                />
              </div>

              {/* Pricing Options */}
              <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-dark text-xs uppercase tracking-wider">
                    Delegate Pricing Model
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="conf_is_paid"
                        checked={!formData.is_paid}
                        onChange={() => setFormData({ ...formData, is_paid: false, price: "Free" })}
                        className="text-primary"
                      />
                      <span className="font-semibold text-dark">Free Entry</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="conf_is_paid"
                        checked={formData.is_paid}
                        onChange={() => setFormData({ ...formData, is_paid: true, price: "₹999" })}
                        className="text-primary"
                      />
                      <span className="font-semibold text-dark">Paid Delegate Pass</span>
                    </label>
                  </div>
                </div>

                {formData.is_paid && (
                  <div className="space-y-4 pt-3 border-t border-gray-200">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block font-semibold text-dark">Delegate Fee / Price *</label>
                        <input
                          type="text"
                          placeholder="e.g. ₹999 or ₹2,499"
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
                  <label className="mb-1 block font-semibold text-dark">Venue / Mode *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bhubaneswar / Hybrid"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-dark">Event Date *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. November 14-15, 2026"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-semibold text-dark">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. National Conference"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                  />
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

              {/* Image Upload */}
              <ImageUpload
                label="Conference Poster / Logo"
                value={formData.image}
                onChange={(url) => setFormData({ ...formData, image: url })}
                bucket="media"
                folder="conferences"
              />

              <div>
                <label className="mb-1 block font-semibold text-dark">Registration Link</label>
                <input
                  type="text"
                  placeholder="/contact"
                  value={formData.registration_link}
                  onChange={(e) => setFormData({ ...formData, registration_link: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-dark">
                  Key Highlights / Keynotes (One per line)
                </label>
                <textarea
                  rows={3}
                  placeholder={"Keynotes by Civil Pioneers\nPeer-Reviewed Paper Presentations\nProceedings with DOI"}
                  value={formData.highlights}
                  onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                />
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
                  {saving ? "Saving..." : editingItem ? "Update Conference" : "Create Conference"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
