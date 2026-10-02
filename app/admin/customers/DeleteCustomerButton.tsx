"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteCustomerButton({ userId, name }: { userId: string; name: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (!window.confirm(`"${name}" adlı müşteriyi silmek istediğinize emin misiniz?`)) return;
    setPending(true);
    setError("");

    const response = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });

    if (!response.ok) {
      setError("Silinemedi.");
      setPending(false);
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        className="text-sm font-medium text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-40"
      >
        Sil
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
