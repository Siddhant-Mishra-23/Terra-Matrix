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
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div
        className="flex-1 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="w-full max-w-xl overflow-y-auto bg-white p-8">
        <button
          onClick={onClose}
          className="mb-6 text-sm text-gray-500 hover:text-primary"
        >
          &lt;- Back to Team
        </button>

        <div className="relative aspect-square w-full overflow-hidden rounded-xl">
          <Image
            src={member.image}
            alt={member.name}
            fill
            className="object-cover"
            sizes="(max-width: 576px) 100vw, 576px"
          />
        </div>

        <h3 className="mt-6 text-2xl font-bold text-gray-900">
          {member.name}
        </h3>
        <p className="text-primary">{member.role}</p>
        <p className="text-sm text-gray-600">
          {member.domain}
        </p>

        <p className="mt-4 text-gray-600">
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
