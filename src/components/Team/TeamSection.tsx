"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TeamMember } from "@/types/team";
import { Team_Member } from "./TeamData";
import TeamDrawyer from "./TeamDrawyer";

export default function TeamSection() {
  const [activeMember, setActiveMember] = useState<TeamMember | null>(null);
  const [shuffledMembers, setShuffledMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    // Separate partners (id 1, 2, 3) and others
    const partners = Team_Member.filter((member) => [1, 2, 3].includes(member.id));
    const others = Team_Member.filter((member) => ![1, 2, 3].includes(member.id));

    // Fisher-Yates shuffle
    const shuffleArray = <T,>(array: T[]): T[] => {
      const arr = [...array];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };

    // Partners shuffled at top, others shuffled below
    setShuffledMembers([...shuffleArray(partners), ...shuffleArray(others)]);
  }, []);

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {shuffledMembers.map((member, index) => (
          <motion.button
            key={member.id}
            onClick={() => setActiveMember(member)}
            className="rounded-xl border border-gray-200 bg-white p-5 text-left"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true, margin: "-50px" }}
            whileHover={{
              scale: 1.03,
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
          >
            <img
              src={member.image}
              alt={member.name}
              className="aspect-square w-full rounded-lg object-cover"
            />

            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              {member.name}
            </h3>
            <p className="text-sm text-primary">{member.role}</p>
            <p className="mt-1 text-sm text-gray-600">
              {member.domain}
            </p>
          </motion.button>
        ))}
      </div>

      {/* Side Drawer */}
      <TeamDrawyer
        member={activeMember}
        onClose={() => setActiveMember(null)}
      />
    </section>
  );
}
