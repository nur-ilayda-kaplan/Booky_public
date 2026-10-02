"use client";

import { useState, type FormEvent } from "react";
import type { Dictionary } from "@/lib/getDictionary";

export function NewsletterForm({ dict }: { dict: Dictionary }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("sending");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p className="rounded-md bg-white/80 px-4 py-3 text-base text-brand-primary">
        {dict.comingSoon.subscribeSuccess}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={dict.comingSoon.emailPlaceholder}
          className="w-full flex-1 rounded-md border border-black/10 bg-white px-4 py-3 text-base focus:border-brand-primary focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-md bg-brand-primary px-5 py-3 text-base font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "sending" ? dict.comingSoon.subscribing : dict.comingSoon.subscribe}
        </button>
      </div>
      {status === "error" && (
        <p className="text-sm text-red-600">{dict.comingSoon.subscribeError}</p>
      )}
    </form>
  );
}
