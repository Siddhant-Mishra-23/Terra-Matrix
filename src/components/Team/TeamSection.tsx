"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { TeamMember } from "@/types/team";
import { Team_Member, GROUPS } from "./TeamData";
import TeamDrawyer from "./TeamDrawyer";

export default function TeamSection() {
  const [activeMember, setActiveMember] = useState<TeamMember | null>(null);

  const sections = [
    { title: "Core Team", ids: GROUPS.coreTeam },
    { title: "IT Advisors", ids: GROUPS.itAdvisors },
    { title: "Remote Sensing Experts", ids: GROUPS.remoteSensing },
    { title: "Civil Engineering Consultants", ids: GROUPS.civilEngineering },
    { title: "Structural Design Engineers", ids: GROUPS.structuralEngineering },
    { title: "Law Professional Advisors", ids: GROUPS.lawProfessionals },
  ];

  const getMembersForSection = (ids: number[]): TeamMember[] => {
    return ids
      .map((id) => Team_Member.find((member) => member.id === id))
      .filter((member): member is TeamMember => !!member);
  };

  return (
    <section className="container mx-auto px-4 py-16">
      {sections.map((section) => {
        const members = getMembersForSection(section.ids);
        if (members.length === 0) return null;

        return (
          <div key={section.title} className="mb-16 last:mb-0">
            <h2 className="mb-8 text-2xl font-bold text-gray-900 border-b border-gray-200 pb-3">
              {section.title}
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {members.map((member, index) => (
                <motion.button
                  key={`${section.title}-${member.id}`}
                  onClick={() => setActiveMember(member)}
                  className="rounded-xl border border-gray-200 bg-white p-5 text-left flex flex-col justify-between"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  viewport={{ once: true, margin: "-50px" }}
                  whileHover={{
                    scale: 1.03,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-full">
                    <div className="relative aspect-square w-full overflow-hidden rounded-lg mb-4">
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
                </motion.button>
              ))}
            </div>
          </div>
        );
      })}

      {/* Side Drawer */}
      <TeamDrawyer
        member={activeMember}
        onClose={() => setActiveMember(null)}
      />
    </section>
  );
}
