"use client";

import Breadcrumb from "@/components/Common/Breadcrumb";
import projectData from "@/components/Project/projectData";
import { createClient } from "@/lib/supabase/client";
import { Project } from "@/types/project";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function DynamicProjectDetailsPage() {
  const params = useParams();
  const rawId = params?.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!rawId) return;

    const fetchProject = async () => {
      try {
        const supabase = createClient();
        // Query by id (UUID or numeric string)
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("id", rawId)
          .single();

        if (!error && data) {
          setProject({
            id: data.id,
            title: data.title,
            paragraph: data.paragraph,
            image: data.image || "/images/project/Project-01.png",
            href: `/project-details/${data.id}`,
            author: {
              name: data.author_name || "Terra Matrix",
              image: data.author_image || "/images/favicon.png",
              designation: data.author_designation || "Engineering Team",
            },
            tags: data.tags || ["Infrastructure"],
            publishDate: data.publish_date || "2026",
            content: data.content,
          });
        } else {
          // Fallback to static array match if not found in database
          const fallbackMatch = projectData.find(
            (p) => String(p.id) === rawId || p.href.includes(rawId)
          );
          if (fallbackMatch) {
            setProject(fallbackMatch);
          }
        }
      } catch (err) {
        console.error("Error fetching project details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [rawId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center pt-32">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />
          <p className="text-xs text-body-color font-medium">Loading project case study...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <div className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h3 className="text-xl font-bold text-dark mb-2">Project Not Found</h3>
          <p className="text-xs text-body-color mb-6">
            The project you are looking for does not exist or may have been removed.
          </p>
          <Link
            href="/project"
            className="inline-flex rounded-lg bg-primary px-5 py-2.5 text-xs font-bold text-white transition hover:bg-primary/90"
          >
            ← Back to All Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb
        pageName={project.title}
        description={project.paragraph.slice(0, 160) + (project.paragraph.length > 160 ? "..." : "")}
      />

      <section className="pt-10 pb-20 md:pb-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            {/* Header Tags & Metadata */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-primary/20">
                  <Image
                    src={project.author.image || "/images/favicon.png"}
                    alt={project.author.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-dark">{project.author.name}</h4>
                  <p className="text-xs text-body-color">{project.author.designation}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-body-color font-medium">Published:</span>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-dark">
                  {project.publishDate}
                </span>
              </div>
            </div>

            {/* Cover Image */}
            <div className="relative mb-10 aspect-16/9 w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-md">
              <Image
                src={project.image}
                alt={project.title}
                fill
                priority
                className="object-cover"
              />
            </div>

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="mb-6 flex flex-wrap items-center gap-2">
                {project.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Summary Box */}
            <div className="mb-8 rounded-2xl border-l-4 border-primary bg-primary/5 p-6 text-sm sm:text-base leading-relaxed text-dark font-medium">
              {project.paragraph}
            </div>

            {/* Extended Content if present */}
            {project.content ? (
              <div className="prose prose-sm sm:prose-base max-w-none text-body-color leading-relaxed space-y-4">
                <div dangerouslySetInnerHTML={{ __html: project.content }} />
              </div>
            ) : (
              <div className="space-y-4 text-sm leading-relaxed text-body-color">
                <p>
                  Terra-Matrix engineering and analytics specialists conducted comprehensive field validation, remote sensing data acquisition, and spatial machine learning simulations for this initiative.
                </p>
                <p>
                  Our multidisciplinary infrastructure team integrates high-resolution satellite raster datasets, digital elevation models (DEM), and numerical predictive algorithms to deliver sustainable, actionable insights for public and private stakeholders.
                </p>
              </div>
            )}

            {/* Back Navigation Bar */}
            <div className="mt-12 flex items-center justify-between border-t border-gray-200 pt-6">
              <Link
                href="/project"
                className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline"
              >
                ← Back to Project Grid
              </Link>

              <Link
                href="/contact"
                className="rounded-lg bg-green px-4 py-2 text-xs font-bold text-white transition hover:bg-primary shadow-sm"
              >
                Inquire About Similar Solutions
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
