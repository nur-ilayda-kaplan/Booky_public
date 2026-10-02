"use client";

import { useState, type FormEvent } from "react";
import { signOut } from "next-auth/react";
import { PasswordField } from "@/components/admin/PasswordField";

type FormState = {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
};

function TextField({
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-foreground/70">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
      />
    </div>
  );
}

export function AccountForm({ initial }: { initial: { name: string; email: string } }) {
  const [form, setForm] = useState<FormState>({
    name: initial.name,
    email: initial.email,
    currentPassword: "",
    newPassword: "",
    newPasswordConfirm: "",
  });
  const [status, setStatus] = useState<"idle" | "saving" | "done">("idle");
  const [error, setError] = useState("");

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!form.currentPassword) {
      setError("Değişiklikleri kaydetmek için mevcut şifreni gir.");
      return;
    }
    if (form.newPassword && form.newPassword.length < 8) {
      setError("Yeni şifre en az 8 karakter olmalı.");
      return;
    }
    if (form.newPassword && form.newPassword !== form.newPasswordConfirm) {
      setError("Yeni şifreler eşleşmiyor.");
      return;
    }

    setStatus("saving");

    const response = await fetch("/api/admin/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        currentPassword: form.currentPassword,
        newPassword: form.newPassword || undefined,
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      const message =
        data?.error === "WRONG_PASSWORD"
          ? "Mevcut şifre yanlış."
          : data?.error === "EMAIL_TAKEN"
            ? "Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor."
            : data?.error === "INVALID_EMAIL"
              ? "Geçerli bir e-posta adresi gir."
              : data?.error === "INVALID_NEW_PASSWORD"
                ? "Yeni şifre en az 8 karakter olmalı."
                : "Kaydedilemedi. Lütfen tekrar deneyin.";
      setError(message);
      setStatus("idle");
      return;
    }

    setStatus("done");
    setTimeout(() => {
      signOut({ callbackUrl: "/giris-yap?callbackUrl=%2Fadmin%2Faccount" });
    }, 1800);
  }

  if (status === "done") {
    return (
      <div className="max-w-2xl rounded-lg border border-green-200 bg-green-50 p-5 text-sm text-green-800">
        Bilgilerin güncellendi. Güvenlik için birazdan çıkış yapılacak, yeni e-posta ve şifrenle
        tekrar giriş yapman gerekecek.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-lg border border-black/5 bg-white p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground/50">
          Hesap Bilgileri
        </h3>
        <TextField label="İsim" value={form.name} onChange={(v) => set("name", v)} />
        <TextField
          label="E-posta"
          type="email"
          value={form.email}
          onChange={(v) => set("email", v)}
          autoComplete="email"
        />
      </section>

      <section className="flex flex-col gap-4 rounded-lg border border-black/5 bg-white p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground/50">
          Şifre Değiştir
        </h3>
        <p className="text-sm text-foreground/50">
          Şifreni değiştirmek istemiyorsan yeni şifre alanlarını boş bırakabilirsin.
        </p>
        <PasswordField
          label="Mevcut Şifre"
          value={form.currentPassword}
          onChange={(v) => set("currentPassword", v)}
          autoComplete="current-password"
        />
        <PasswordField
          label="Yeni Şifre"
          value={form.newPassword}
          onChange={(v) => set("newPassword", v)}
          autoComplete="new-password"
        />
        <PasswordField
          label="Yeni Şifre (Tekrar)"
          value={form.newPasswordConfirm}
          onChange={(v) => set("newPasswordConfirm", v)}
          autoComplete="new-password"
        />
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={status === "saving"}
          className="rounded-md bg-brand-primary px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {status === "saving" ? "Kaydediliyor..." : "Kaydet"}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </form>
  );
}
