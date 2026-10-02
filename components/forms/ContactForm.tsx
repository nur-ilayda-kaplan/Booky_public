"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { FormField, FormTextarea } from "./FormField";
import { localePath } from "@/lib/localePath";
import type { Locale } from "@/config/i18n.config";
import type { Dictionary } from "@/lib/getDictionary";

// Google reCAPTCHA v2 (checkbox) — spam botlarına karşı, sadece bu formda
// (bkz. lib/recaptcha.ts'teki sunucu tarafı doğrulama). Site anahtarı
// https://www.google.com/recaptcha/admin adresinden domain kaydedilerek
// alınır; ortam değişkeni boşsa widget hiç render edilmez ve gönderim
// sunucu tarafında zaten yapılandırma eksikliğinden reddedilir.
declare global {
  interface Window {
    grecaptcha?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
        },
      ) => number;
      reset: (widgetId?: number) => void;
      ready: (callback: () => void) => void;
    };
  }
}

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
const RECAPTCHA_SCRIPT_SRC = "https://www.google.com/recaptcha/api.js";

export function ContactForm({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [kvkkAccepted, setKvkkAccepted] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error" | "recaptcha" | "kvkk"
  >("idle");
  const [recaptchaToken, setRecaptchaToken] = useState("");

  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) return;

    function renderWidget() {
      if (!recaptchaContainerRef.current || !window.grecaptcha || widgetIdRef.current !== null) {
        return;
      }
      widgetIdRef.current = window.grecaptcha.render(recaptchaContainerRef.current, {
        sitekey: RECAPTCHA_SITE_KEY as string,
        callback: (token) => setRecaptchaToken(token),
        "expired-callback": () => setRecaptchaToken(""),
      });
    }

    if (window.grecaptcha) {
      window.grecaptcha.ready(renderWidget);
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${RECAPTCHA_SCRIPT_SRC}"]`,
    );
    if (existingScript) {
      existingScript.addEventListener("load", () => window.grecaptcha?.ready(renderWidget));
      return;
    }

    const script = document.createElement("script");
    script.src = RECAPTCHA_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => window.grecaptcha?.ready(renderWidget);
    document.head.appendChild(script);
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!kvkkAccepted) {
      setStatus("kvkk");
      return;
    }

    if (RECAPTCHA_SITE_KEY && !recaptchaToken) {
      setStatus("recaptcha");
      return;
    }

    setStatus("sending");

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, message, recaptchaToken }),
    });

    // v2 token'ları tek kullanımlık — başarılı da olsa başarısız da olsa
    // widget sıfırlanır, kullanıcı gerekirse tazeden bir token'la yeniden dener.
    if (widgetIdRef.current !== null) {
      window.grecaptcha?.reset(widgetIdRef.current);
    }
    setRecaptchaToken("");

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setStatus(data?.error === "RECAPTCHA_FAILED" ? "recaptcha" : "error");
      return;
    }

    setStatus("success");
    setName("");
    setEmail("");
    setPhone("");
    setMessage("");
    setKvkkAccepted(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-lg border border-black/5 bg-white p-5"
    >
      <FormField label={dict.contact.formName} value={name} onChange={setName} required />
      <FormField
        label={dict.contact.formEmail}
        value={email}
        onChange={setEmail}
        required
        type="email"
      />
      <FormField
        label={dict.contact.formPhone}
        value={phone}
        onChange={setPhone}
        required
        type="tel"
      />
      <FormTextarea label={dict.contact.formMessage} value={message} onChange={setMessage} required />
      <label className="flex items-start gap-2 text-sm text-foreground/70">
        <input
          type="checkbox"
          required
          checked={kvkkAccepted}
          onChange={(event) => setKvkkAccepted(event.target.checked)}
          className="mt-0.5 shrink-0"
        />
        <span>
          {dict.contact.kvkkConsentPrefix}
          <Link
            href={localePath(locale, "/legal/kvkk-aydinlatma-metni")}
            target="_blank"
            className="font-medium text-brand-primary hover:underline"
          >
            {dict.legal.kvkk.title}
          </Link>
          {dict.contact.kvkkConsentSuffix}
        </span>
      </label>
      {RECAPTCHA_SITE_KEY && <div ref={recaptchaContainerRef} />}
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-md bg-brand-primary px-5 py-3 text-base font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "sending" ? dict.contact.sending : dict.contact.send}
      </button>
      {status === "kvkk" && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-base text-red-700">
          {dict.contact.kvkkConsentRequired}
        </p>
      )}
      {status === "recaptcha" && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-base text-red-700">
          {dict.contact.recaptchaRequired}
        </p>
      )}
      {status === "success" && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-base text-green-700">
          {dict.contact.success}
        </p>
      )}
      {status === "error" && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-base text-red-700">
          {dict.contact.error}
        </p>
      )}
    </form>
  );
}
