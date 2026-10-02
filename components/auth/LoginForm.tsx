"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { FormField, PasswordField } from "@/components/forms/FormField";
import { localePath } from "@/lib/localePath";
import type { Locale } from "@/config/i18n.config";
import type { Dictionary } from "@/lib/getDictionary";

export function LoginForm({
  locale,
  dict,
  callbackUrl,
}: {
  locale: Locale;
  dict: Dictionary;
  callbackUrl: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("submitting");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setStatus("error");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-lg border border-black/5 bg-white p-5"
    >
      <FormField
        label={dict.checkout.email}
        value={email}
        onChange={setEmail}
        required
        type="email"
      />
      <PasswordField
        label={dict.auth.password}
        value={password}
        onChange={setPassword}
        required
        autoComplete="current-password"
        showLabel={dict.auth.showPassword}
        hideLabel={dict.auth.hidePassword}
      />
      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-md bg-brand-primary px-5 py-3 text-base font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? dict.common.loading : dict.auth.login}
      </button>
      {status === "error" && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-base text-red-700">
          {dict.auth.loginError}
        </p>
      )}
      <p className="text-center text-base leading-relaxed text-foreground/60">
        {dict.auth.noAccount}{" "}
        <Link
          href={`${localePath(locale, "/uye-ol")}?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="font-medium text-brand-primary hover:underline"
        >
          {dict.auth.register}
        </Link>
      </p>
    </form>
  );
}
