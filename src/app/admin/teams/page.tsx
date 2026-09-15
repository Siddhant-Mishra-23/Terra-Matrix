"use client";

import ImageUpload from "@/components/Admin/ImageUpload";
import { GROUPS, Team_Member as fallbackTeamMembers } from "@/components/Team/TeamData";
import { deleteStorageFileIfUploaded } from "@/lib/storage-cleanup";
import { createClient } from "@/lib/supabase/client";
import { TeamMember } from "@/types/team";
import Image from "next/image";
import { useEffect, useState } from "react";

const CATEGORY_GROUPS = [
  "Core Team",
  "IT Advisors",
  "Remote Sensing Experts",
  "Civil Engineering Consultants",
  "Structural Design Engineers",
  "Law Professional Advisors",
];

function getCategoryGroupForId(id: number | string): string {
  const numId = Number(id);
  if (GROUPS.coreTeam.includes(numId)) return "Core Team";
  if (GROUPS.itAdvisors.includes(numId)) return "IT Advisors";
  if (GROUPS.remoteSensing.includes(numId)) return "Remote Sensing Experts";
  if (GROUPS.civilEngineering.includes(numId)) return "Civil Engineering Consultants";
  if (GROUPS.structuralEngineering.includes(numId)) return "Structural Design Engineers";
  if (GROUPS.lawProfessionals.includes(numId)) return "Law Professional Advisors";
  return "Core Team";
}

export default function AdminTeamsPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncingDefaults, setSyncingDefaults] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TeamMember | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // In-depth Form State
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    domain: "",
    categoryGroup: "Core Team",
    image: "/images/favicon.png",
    summary: "",
    expertise: "",
    experience: "",
    achievements: "",
    softwareSkills: "",
    education: "",
    contactNumber: "",
    email: "",
    order_index: 0,
  });

  const notifySuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const fetchTeamMembers = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) {
        console.error("Error fetching teams from Supabase:", error);
      } else if (data && data.length > 0) {
        const mapped: TeamMember[] = data.map((d: any) => ({
          id: d.id,
          name: d.name,
          role: d.role || d.designation || "",
          domain: d.domain || "",
          categoryGroup: d.category_group || getCategoryGroupForId(d.order_index || 1),
          image: d.image || "/images/favicon.png",
          summary: d.summary || d.bio || "",
          expertise: d.expertise || [],
          experience: d.experience || [],
          Achievements: d.achievements || [],
          softwareSkills: d.software_skills || [],
          education: d.education || [],
          ContactNumber: d.contact_number || "",
          email: d.email || "",
          order_index: d.order_index || 0,
        }));
        setMembers(mapped);
      } else {
        // If DB has 0 records, fallback to in-memory defaults
        setMembers(
          fallbackTeamMembers.map((m) => ({
            ...m,
            categoryGroup: getCategoryGroupForId(m.id),
            order_index: typeof m.id === "number" ? m.id : 0,
          }))
        );
      }
    } catch (err) {
      console.error("Fetch teams catch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchTeamMembers();
    notifySuccess("Team profiles refreshed from database!");
  };

  const handleSeedDefaultProfiles = async () => {
    if (
      !confirm(
        "This will initialize/seed all 18 default in-depth team profiles into your Supabase database. Continue?"
      )
    )
      return;

    setSyncingDefaults(true);
    const supabase = createClient();

    const payload = fallbackTeamMembers.map((m, idx) => ({
      name: m.name,
      role: m.role,
      designation: m.role,
      domain: m.domain,
      category_group: getCategoryGroupForId(m.id),
      image: m.image,
      summary: m.summary || "",
      bio: m.summary || "",
      expertise: m.expertise || [],
      experience: m.experience || [],
      achievements: m.Achievements || [],
      software_skills: m.softwareSkills || [],
      education: m.education || [],
      contact_number: m.ContactNumber || "",
      email: m.email || "",
      order_index: idx + 1,
      updated_at: new Date().toISOString(),
    }));

    try {
      const { error } = await supabase.from("teams").upsert(payload, { onConflict: "id" });
      if (error) {
        // If upsert without id fails, perform clean insert
        await supabase.from("teams").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        const { error: insErr } = await supabase.from("teams").insert(payload);
        if (insErr) throw insErr;
      }

      notifySuccess("Successfully seeded all 18 default profiles to Supabase!");
      await fetchTeamMembers();
    } catch (err: any) {
      console.error("Seed error:", err);
      alert("Failed to seed team members: " + (err.message || "Unknown error"));
    } finally {
      setSyncDefaults(false);
    }
  };

  const setSyncDefaults = (val: boolean) => setSyncingDefaults(val);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      role: "",
      domain: "",
      categoryGroup: "Core Team",
      image: "/images/favicon.png",
      summary: "",
      expertise: "",
      experience: "",
      achievements: "",
      softwareSkills: "",
      education: "",
      contactNumber: "",
      email: "",
      order_index: members.length + 1,
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: TeamMember) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      role: item.role,
      domain: item.domain,
      categoryGroup: item.categoryGroup || "Core Team",
      image: item.image,
      summary: item.summary || "",
      expertise: (item.expertise || []).join("\n"),
      experience: (item.experience || []).join("\n"),
      achievements: (item.Achievements || []).join("\n"),
      softwareSkills: (item.softwareSkills || []).join("\n"),
      education: (item.education || []).join("\n"),
      contactNumber: item.ContactNumber || "",
      email: item.email || "",
      order_index: item.order_index || 0,
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    const supabase = createClient();

    const parseLines = (text: string) =>
      text
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

    const payload = {
      name: formData.name,
      role: formData.role,
      designation: formData.role,
      domain: formData.domain,
      category_group: formData.categoryGroup,
      image: formData.image,
      summary: formData.summary,
      bio: formData.summary,
      expertise: parseLines(formData.expertise),
      experience: parseLines(formData.experience),
      achievements: parseLines(formData.achievements),
      software_skills: parseLines(formData.softwareSkills),
      education: parseLines(formData.education),
      contact_number: formData.contactNumber,
      email: formData.email,
      order_index: Number(formData.order_index) || 0,
      updated_at: new Date().toISOString(),
    };

    try {
      const isExistingUuid = editingItem && typeof editingItem.id === "string" && editingItem.id.includes("-");

      if (isExistingUuid) {
        const { error } = await supabase
          .from("teams")
          .update(payload)
          .eq("id", editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("teams").insert([payload]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      await fetchTeamMembers();
      notifySuccess(`Team profile "${formData.name}" saved successfully!`);
    } catch (err: any) {
      console.error("Save error:", err);
      setErrorMsg(err.message || "Failed to save team member.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this team member profile?")) return;

    const itemToDelete = members.find((t) => t.id === id);
    const supabase = createClient();
    try {
      if (typeof id === "string" && id.includes("-")) {
        const { error } = await supabase.from("teams").delete().eq("id", id);
        if (error) throw error;
      }
      if (itemToDelete?.image) {
        await deleteStorageFileIfUploaded(itemToDelete.image);
      }
      setMembers((prev) => prev.filter((t) => t.id !== id));
      notifySuccess("Team member profile deleted successfully!");
    } catch (err: any) {
      alert("Error deleting member: " + (err.message || "Failed to delete"));
    }
  };

  const filtered = members.filter((item) => {
    const matchesGroup =
      selectedGroup === "all" ? true : item.categoryGroup === selectedGroup;
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.role.toLowerCase().includes(search.toLowerCase()) ||
      item.domain.toLowerCase().includes(search.toLowerCase());
    return matchesGroup && matchesSearch;
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
            Team Profiles Management
          </h2>
          <p className="text-xs text-body-color">
            Manage profiles: Expertise, Achievements, Skills, Experience, Education, and Contact ({members.length} members).
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
            Add New Member
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between shadow-one">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedGroup("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              selectedGroup === "all"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All ({members.length})
          </button>
          {CATEGORY_GROUPS.map((grp) => (
            <button
              key={grp}
              onClick={() => setSelectedGroup(grp)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                selectedGroup === grp
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {grp} ({members.filter((m) => m.categoryGroup === grp).length})
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search by name, role, domain..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-dark focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-one">
        {loading ? (
          <div className="p-12 text-center text-sm text-body-color">
            <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Loading team profiles from Supabase...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-body-color space-y-3">
            <p>No team members found.</p>
            <button
              onClick={handleSeedDefaultProfiles}
              disabled={syncingDefaults}
              className="inline-flex items-center gap-2 rounded-lg bg-primary/10 border border-primary px-4 py-2 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition"
            >
              {syncingDefaults ? "Seeding..." : "Seed Default 18 Team Profiles to Database"}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="border-b border-gray-200 bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-3.5">Member</th>
                  <th className="px-6 py-3.5">Role & Domain</th>
                  <th className="px-6 py-3.5">Category Group</th>
                  <th className="px-6 py-3.5">In-Depth Details Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-100 border border-gray-200">
                          <Image
                            src={item.image || "/images/favicon.png"}
                            alt={item.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-dark text-sm">{item.name}</p>
                          <p className="line-clamp-1 text-[11px] text-body-color max-w-xs">
                            {item.summary}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-dark">{item.role}</p>
                      <p className="text-[11px] text-primary">{item.domain}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded bg-primary/10 px-2 py-0.5 font-medium text-primary text-[10px]">
                        {item.categoryGroup}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 text-[10px] text-body-color">
                        <span className="rounded bg-gray-100 px-1.5 py-0.5">
                          {item.expertise?.length || 0} Expertise
                        </span>
                        <span className="rounded bg-gray-100 px-1.5 py-0.5">
                          {item.Achievements?.length || 0} Achievements
                        </span>
                        <span className="rounded bg-gray-100 px-1.5 py-0.5">
                          {item.softwareSkills?.length || 0} Skills
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-dark transition"
                          title="Edit In-Depth Profile"
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

      {/* COMPREHENSIVE IN-DEPTH MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 sm:p-8 shadow-two">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-dark">
                  {editingItem ? "Edit Team Profile" : "Add Team Member"}
                </h3>
                <p className="text-xs text-body-color">
                  Full profile configuration saved directly into Supabase.
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

            <form onSubmit={handleSave} className="space-y-5 text-xs">
              {/* Row 1: Basic Info */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-semibold text-dark">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Sovan Sankalp"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-dark">Role / Designation *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Water Resources Engineer"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 2: Domain & Category Group */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block font-semibold text-dark">Domain *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hydrology, GIS & AI/ML"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-dark">Category Group *</label>
                  <select
                    value={formData.categoryGroup}
                    onChange={(e) => setFormData({ ...formData, categoryGroup: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                  >
                    {CATEGORY_GROUPS.map((grp) => (
                      <option key={grp} value={grp}>
                        {grp}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-dark">Display Order Index</label>
                  <input
                    type="number"
                    value={formData.order_index}
                    onChange={(e) =>
                      setFormData({ ...formData, order_index: Number(e.target.value) || 0 })
                    }
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <ImageUpload
                label="Profile Picture"
                value={formData.image}
                onChange={(url) => setFormData({ ...formData, image: url })}
                bucket="media"
                folder="team"
              />

              {/* Summary / Bio */}
              <div>
                <label className="mb-1 block font-semibold text-dark">
                  Executive Summary / Professional Bio *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detailed multi-sentence summary about the engineer or advisor..."
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                />
              </div>

              {/* In-Depth Multi-Line Array Fields */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-semibold text-dark">
                    Key Areas of Expertise (One per line)
                  </label>
                  <textarea
                    rows={4}
                    placeholder={"Hydrological Modelling\nGroundwater Assessment\nUrban Flood Risk Mapping"}
                    value={formData.expertise}
                    onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-dark">
                    Professional Experience Points (One per line)
                  </label>
                  <textarea
                    rows={4}
                    placeholder={"10+ years of research and teaching\nUrban flood susceptibility mapping\nConsultant for government projects"}
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block font-semibold text-dark">
                    Key Achievements & Publications (One per line)
                  </label>
                  <textarea
                    rows={3}
                    placeholder={"20+ SCI/Scopus journal publications\nBest Poster Award – ESRI 2025\nPublished 3 patents"}
                    value={formData.achievements}
                    onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-dark">
                    Software Skills (One per line)
                  </label>
                  <textarea
                    rows={3}
                    placeholder={"ArcGIS Pro\nQGIS\nPython\nHEC-RAS\nAutoCAD"}
                    value={formData.softwareSkills}
                    onChange={(e) => setFormData({ ...formData, softwareSkills: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-dark">
                    Education Degrees (One per line)
                  </label>
                  <textarea
                    rows={3}
                    placeholder={"Ph.D. – Civil Engineering, NIT Rourkela\nM.Tech – Water Resources\nB.Tech – Civil Engineering"}
                    value={formData.education}
                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-semibold text-dark">Contact Number</label>
                  <input
                    type="text"
                    placeholder="+91-XXXXXXXXXX"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-dark">Email Address</label>
                  <input
                    type="email"
                    placeholder="example@terramatrix.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Modal Actions */}
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
                  {saving ? "Saving to Supabase..." : editingItem ? "Update Profile" : "Create Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
