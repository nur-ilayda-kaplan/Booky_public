"use client";

import { useState } from "react";
import { TeamCard } from "@/components/team/TeamCard";
import { TeamMemberModal } from "@/components/team/TeamMemberModal";
import type { TeamMember } from "@/types";

export function TeamGrid({
  members,
  closeLabel,
}: {
  members: TeamMember[];
  closeLabel: string;
}) {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {members.map((member) => (
          <TeamCard key={member.id} member={member} onSelect={setSelectedMember} />
        ))}
      </div>

      <TeamMemberModal
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
        closeLabel={closeLabel}
      />
    </>
  );
}
