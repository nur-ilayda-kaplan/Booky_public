"use client";

import Image from "next/image";
import type { TeamMember } from "@/types";

export function TeamCard({
  member,
  onSelect,
}: {
  member: TeamMember;
  onSelect: (member: TeamMember) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(member)}
      aria-haspopup="dialog"
      className="flex cursor-pointer flex-col items-center rounded-lg border border-black/5 bg-white p-5 text-center transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
    >
      <div className="relative h-28 w-28 overflow-hidden rounded-full bg-brand-accent/20">
        {member.photo && (
          <Image src={member.photo} alt={member.name} fill sizes="112px" className="object-cover" />
        )}
      </div>
      <h3 className="mt-3 font-serif text-base font-semibold">{member.name}</h3>
      <p className="mt-1 text-sm font-medium text-brand-primary">{member.role}</p>
      {member.bio && <p className="mt-2 line-clamp-3 text-sm text-foreground/60">{member.bio}</p>}
    </button>
  );
}
