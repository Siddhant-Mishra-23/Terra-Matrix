"use client";

import { createClient } from "@/lib/supabase/client";
import { Project as ProjectType } from "@/types/project";
import { useEffect, useState } from "react";
import SectionTitle from "../Common/SectionTitle";
import SingleProject from "./SingleProject";
import fallbackProjects from "./projectData";

const Project = () => {
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        const mapped: ProjectType[] = data.map((d: any) => ({
          id: d.id,
          title: d.title,
          paragraph: d.paragraph,
          image: d.image || "/images/project/Project-01.png",
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
      } else if (error) {
        console.warn("Error fetching projects from Supabase, using fallback:", error);
        setProjects(fallbackProjects);
      }
    } catch (err) {
      console.error("Error fetching projects from Supabase:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();

    // Realtime listener
    const supabase = createClient();
    const channel = supabase
      .channel("public-projects-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "projects" },
        () => {
          fetchProjects();
        }
      )
      .subscribe();

    // Re-fetch on tab focus
    const handleFocus = () => fetchProjects();
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, []);

  return (
    <section id="project" className="bg-gray-light py-16 md:py-20 lg:py-28">
      <div className="container">
        <SectionTitle
          title="Our Latest Projects"
          paragraph="Explore our engineering and geospatial solutions driving sustainable development and innovation."
          center
        />

        {projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center text-sm text-body-color bg-white/70">
            No projects available at the moment. Please check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 items-stretch">
            {projects.map((project) => (
              <div key={project.id} className="w-full flex h-full">
                <SingleProject project={project} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>

  );
};

export default Project;
