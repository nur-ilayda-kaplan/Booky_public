"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@prisma/client";
import { ROLE_LABELS } from "./roleLabels";

export function UserRoleToggle({
  userId,
  role,
  isLastSuperAdmin,
}: {
  userId: string;
  role: Role;
  isLastSuperAdmin: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const disabled = pending || (role === "SUPER_ADMIN" && isLastSuperAdmin);

  async function handleChange(nextRole: Role) {
    if (nextRole === role) return;
    setPending(true);
    setError("");

    const response = await fetch(`/api/admin/users/${userId}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: nextRole }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(
        data?.error === "LAST_SUPER_ADMIN"
          ? "Sistemde en az bir süper yönetici kalmalı."
          : "Bir hata oluştu.",
      );
      setPending(false);
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <select
        value={role}
        disabled={disabled}
        onChange={(event) => handleChange(event.target.value as Role)}
        title={disabled ? "Sistemde en az bir süper yönetici kalmalı" : undefined}
        className="rounded-md border border-black/10 px-2 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-40"
      >
        {(Object.keys(ROLE_LABELS) as Role[]).map((value) => (
          <option key={value} value={value}>
            {ROLE_LABELS[value]}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
