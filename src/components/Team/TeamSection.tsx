"use client";

import { useState } from "react";
import {TeamMember} from "@/types/team"
import {Team_Member} from "./TeamData"
import TeamDrawyer from "./TeamDrawyer";

export default function TeamSection() {
  const [activeMember, setActiveMember] =
    useState<TeamMember | null>(null);

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="flex gap-6 overflow-x-auto pb-4">
        {Team_Member.map((member) => (
          <button
            key={member.id}
            onClick={() => setActiveMember(member)}
            className="min-w-[260px] rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 text-left transition hover:shadow-lg"
          >
            <img
              src={member.image}
              alt={member.name}
              className="h-48 w-full rounded-lg object-cover"
            />

            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              {member.name}
            </h3>
            <p className="text-sm text-primary">{member.role}</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {member.domain}
            </p>
          </button>
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
