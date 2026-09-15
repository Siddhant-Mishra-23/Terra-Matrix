"use client";

import { createClient } from "@/lib/supabase/client";
import { TeamMember } from "@/types/team";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { GROUPS, Team_Member as fallbackMembers } from "./TeamData";
import TeamDrawer from "./TeamDrawer";

const SECTION_ORDER = [
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

export default function TeamSection() {
  const [activeMember, setActiveMember] = useState<TeamMember | null>(null);
  const [allMembers, setAllMembers] = useState<TeamMember[]>(
    fallbackMembers.map((m) => ({
      ...m,
      categoryGroup: getCategoryGroupForId(m.id),
    }))
  );

  useEffect(() => {
    const fetchLiveMembers = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("teams")
          .select("*")
          .order("order_index", { ascending: true });

        if (!error && data && data.length > 0) {
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

          setAllMembers(mapped);
        }
      } catch (err) {
        console.error("Error fetching team profiles from Supabase:", err);
      }
    };

    fetchLiveMembers();
  }, []);

  return (
    <section className="container mx-auto px-4 py-16">
      {SECTION_ORDER.map((sectionTitle) => {
        const members = allMembers.filter(
          (m) => (m.categoryGroup || "Core Team") === sectionTitle
        );
        if (members.length === 0) return null;

        return (
          <div key={sectionTitle} className="mb-16 last:mb-0">
            <h2 className="mb-8 text-2xl font-bold text-gray-900 border-b border-gray-200 pb-3">
              {sectionTitle}
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {members.map((member, index) => (
                <motion.button
                  key={`${sectionTitle}-${member.id}`}
                  onClick={() => setActiveMember(member)}
                  className="rounded-xl border border-gray-200 bg-white p-5 text-left flex flex-col justify-between cursor-pointer transition hover:border-primary"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  viewport={{ once: true, margin: "-50px" }}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
                    transition: { duration: 0.2 },
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-full">
                    <div className="relative aspect-square w-full overflow-hidden rounded-lg mb-4 bg-gray-50">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900">
                      {member.name}
                    </h3>
                    <p className="text-sm text-primary font-medium">{member.role}</p>
                    <p className="mt-1 text-sm text-gray-600">
                      {member.domain}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-primary font-semibold">
                    <span>View In-Depth Profile</span>
                    <span>→</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        );
      })}

      {/* Side Drawer with Full In-Depth Details */}
      <TeamDrawer
        member={activeMember}
        onClose={() => setActiveMember(null)}
      />
    </section>
  );
}
