"use client";

import { TeamMember } from "@/types/team";
import Image from "next/image";

interface TeamDrawerProps {
  member: TeamMember | null;
  onClose: () => void;
}

export default function TeamDrawer({
  member,
  onClose,
}: TeamDrawerProps) {
  if (!member) return null;

  const phoneNumber = member.ContactNumber;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="relative z-10 w-full max-w-lg overflow-y-auto bg-white p-5 sm:p-8 shadow-2xl transition-transform">
        <div className="sticky top-0 z-20 -mx-5 -mt-5 mb-6 flex items-center justify-between border-b border-gray-100 bg-white/95 px-5 py-4 backdrop-blur-md sm:-mx-8 sm:-mt-8 sm:px-8">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Team Profile</span>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700 hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
          >
            ✕ Close
          </button>
        </div>

        <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 shadow-sm">
          <Image
            src={member.image}
            alt={member.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 500px"
          />
        </div>

        <h3 className="mt-5 text-2xl font-black text-dark tracking-tight">
          {member.name}
        </h3>
        <p className="font-bold text-primary text-sm mt-0.5">{member.role}</p>
        <p className="text-xs font-semibold text-gray-500 mt-0.5">
          {member.domain}
        </p>

        <p className="mt-4 text-xs text-body-color leading-relaxed border-t border-gray-100 pt-3">
          {member.summary}
        </p>

        <DetailSection title="Core Expertise" items={member.expertise} />
        <DetailSection title="Achievements" items={member.Achievements} />
        <DetailSection title="Software Skills" items={member.softwareSkills} />
        <DetailSection
          title="Experience & Contributions"
          items={member.experience}
        />
        <DetailSection
          title="Education & Certifications"
          items={member.education}
        />
        <div className="mt-6">
          <h4 className="font-semibold text-gray-900">
            Contact
          </h4>
          <div className="mt-2 text-gray-600">
            <p>{phoneNumber ? `Phone: ${phoneNumber}` : "Phone: N/A"}</p>
            <p>{member.email ? `Email: ${member.email}` : "Email: N/A"}</p>
          </div>
        </div>
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
  if (!items || items.length === 0) return null;

  return (
    <div className="mt-6">
      <h4 className="font-semibold text-gray-900">
        {title}
      </h4>
      <ul className="mt-2 list-disc pl-5 text-gray-600">
        {items.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
