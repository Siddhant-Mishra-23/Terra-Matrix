"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    trainings: 0,
    projects: 0,
    conferences: 0,
    teams: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      const supabase = createClient();
      try {
        const [
          { count: trainingsCount },
          { count: projectsCount },
          { count: conferencesCount },
          { count: teamsCount },
        ] = await Promise.all([
          supabase.from("trainings").select("*", { count: "exact", head: true }),
          supabase.from("projects").select("*", { count: "exact", head: true }),
          supabase.from("conferences").select("*", { count: "exact", head: true }),
          supabase.from("teams").select("*", { count: "exact", head: true }),
        ]);

        setStats({
          trainings: trainingsCount || 0,
          projects: projectsCount || 0,
          conferences: conferencesCount || 0,
          teams: teamsCount || 0,
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  const cards = [
    {
      title: "Trainings",
      count: stats.trainings,
      description: "Upcoming & Completed training programs",
      href: "/admin/trainings",
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      btnText: "Manage Trainings",
    },
    {
      title: "Projects",
      count: stats.projects,
      description: "Infrastructure & geospatial case studies",
      href: "/admin/projects",
      color: "bg-blue-50 text-blue-700 border-blue-200",
      btnText: "Manage Projects",
    },
    {
      title: "Conferences",
      count: stats.conferences,
      description: "Symposiums, webinars & technical forums",
      href: "/admin/conferences",
      color: "bg-purple-50 text-purple-700 border-purple-200",
      btnText: "Manage Conferences",
    },
    {
      title: "Team Members",
      count: stats.teams,
      description: "Consultants, engineers & researchers",
      href: "/admin/teams",
      color: "bg-amber-50 text-amber-700 border-amber-200",
      btnText: "Manage Team",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-green to-primary p-6 sm:p-8 text-white shadow-two">
        <h2 className="text-2xl font-bold sm:text-3xl text-white">
          Welcome to Terra Matrix Control Center
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-gray-100">
          Create, edit, or remove website content in real time. All changes updated here are instantly reflected across public website sections.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-one transition hover:shadow-two"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {card.title}
                </span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${card.color}`}>
                  {loading ? "..." : card.count} Active
                </span>
              </div>
              <p className="mt-4 text-3xl font-extrabold text-dark">
                {loading ? "..." : card.count}
              </p>
              <p className="mt-1 text-xs text-body-color">{card.description}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <Link
                href={card.href}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                <span>{card.btnText}</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Operations Bar */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-dark mb-1">
              Quick Management Shortcuts
            </h3>
            <p className="text-xs text-body-color">
              Create new sessions, case studies, conferences, or manage candidate enrollments.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/admin/trainings"
              className="rounded-xl bg-green px-4 py-2.5 text-xs font-bold text-white hover:bg-primary transition shadow-xs"
            >
              + Add Training
            </Link>
            <Link
              href="/admin/conferences"
              className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs font-bold text-dark hover:border-primary hover:text-primary transition shadow-xs"
            >
              + Add Conference
            </Link>
            <Link
              href="/admin/projects"
              className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs font-bold text-dark hover:border-primary hover:text-primary transition shadow-xs"
            >
              + Add Project
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
