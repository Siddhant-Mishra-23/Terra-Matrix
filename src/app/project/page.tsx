"use client";

import Breadcrumb from "@/components/Common/Breadcrumb";
import fallbackProjectData from "@/components/Project/projectData";
import SingleProject from "@/components/Project/SingleProject";
import { createClient } from "@/lib/supabase/client";
import { Project as ProjectType } from "@/types/project";
import { useEffect, useState } from "react";

const ProjectPage = () => {
  const [projects, setProjects] = useState<ProjectType[]>(fallbackProjectData);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
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
        }
      } catch (err) {
        console.error("Error fetching projects from Supabase:", err);
      }
    };

    fetchProjects();
  }, []);

  return (
    <>
      <Breadcrumb
        pageName="Project Grid"
        description="Explore the Projects by our team. We take pride in delivering exceptional solutions that drive success and innovation for our clients. Get a small overview of the diverse range of projects we have successfully completed, showcasing our expertise and commitment to excellence."
      />

      <section className="pt-[120px] pb-[120px]">
        <div className="container">
          {projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center text-sm text-body-color bg-gray-50/50">
              No projects available at the moment. Please check back soon!
            </div>
          ) : (
            <div className="-mx-4 flex flex-wrap justify-center">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="w-full px-4 md:w-2/3 lg:w-1/2 xl:w-1/3"
                >
                  <SingleProject project={project} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

    </>
  );
};

export default ProjectPage;
