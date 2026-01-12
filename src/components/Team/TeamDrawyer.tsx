"use client";

import {TeamMember}  from "@/types/team";

interface TeamDrawerProps {
  member: TeamMember | null;
  onClose: () => void;
}

export default function TeamDrawer({
  member,
  onClose,
}: TeamDrawerProps) {
  if (!member) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div
        className="flex-1 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="w-full max-w-xl overflow-y-auto bg-white dark:bg-gray-900 p-8">
        <button
          onClick={onClose}
          className="mb-6 text-sm text-gray-500 hover:text-primary"
        >
          ← Back to Team
        </button>

        <img
          src={member.image}
          alt={member.name}
          className="h-64 w-full rounded-xl object-cover"
        />

        <h3 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
          {member.name}
        </h3>
        <p className="text-primary">{member.role}</p>

        <p className="mt-4 text-gray-600 dark:text-gray-400">
          {member.summary}
        </p>

        <DetailSection title="Core Expertise" items={member.expertise} />
        <DetailSection
          title="Experience & Contributions"
          items={member.experience}
        />
        <DetailSection
          title="Education & Certifications"
          items={member.education}
        />
      </aside>
    </div>
  );
}

function DetailSection({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="mt-6">
      <h4 className="font-semibold text-gray-900 dark:text-white">
        {title}
      </h4>
      <ul className="mt-2 list-disc pl-5 text-gray-600 dark:text-gray-400">
        {items.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
