"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function UserNameForm({ userId, initialName }: { userId: string; initialName: string }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setStatus("saving");
    setError("");

    const response = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      setError("Kaydedilemedi. Lütfen tekrar deneyin.");
      setStatus("idle");
      return;
    }

    setStatus("saved");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 flex flex-col gap-3 rounded-lg border border-black/5 bg-white p-5 sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <label className="mb-1 block text-sm font-medium text-foreground/70">İsim</label>
        <input
          type="text"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setStatus("idle");
          }}
          className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={status === "saving" || name.trim() === initialName}
          className="rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "saving" ? "Kaydediliyor..." : "Kaydet"}
        </button>
        {status === "saved" && <span className="text-sm text-green-600">Kaydedildi</span>}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </form>
  );
}
