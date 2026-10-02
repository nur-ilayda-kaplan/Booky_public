"use client";

import { useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import type { SiteSetting } from "@prisma/client";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { IMAGE_SIZES, imageSizeHint } from "@/lib/constants/imageSizes";
import { InstagramIcon } from "@/components/ui/icons/InstagramIcon";
import { WhatsappIcon } from "@/components/ui/icons/WhatsappIcon";
import { FacebookIcon } from "@/components/ui/icons/FacebookIcon";
import { TwitterIcon } from "@/components/ui/icons/TwitterIcon";
import { LinkedinIcon } from "@/components/ui/icons/LinkedinIcon";
import { TiktokIcon } from "@/components/ui/icons/TiktokIcon";
import { YoutubeIcon } from "@/components/ui/icons/YoutubeIcon";
import { SpotifyIcon } from "@/components/ui/icons/SpotifyIcon";
import { SubstackIcon } from "@/components/ui/icons/SubstackIcon";

type FormState = {
  logoUrl: string;
  logoMobileUrl: string;
  faviconUrl: string;
  aboutImageUrl: string;
  aboutLeadTr: string;
  aboutLeadEn: string;
  aboutBodyTr: string;
  aboutBodyEn: string;
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
  whatsappEnabled: boolean;
  workingHours: string;
  mapEmbedUrl: string;
  socialInstagram: string;
  socialInstagramEnabled: boolean;
  socialFacebook: string;
  socialFacebookEnabled: boolean;
  socialX: string;
  socialXEnabled: boolean;
  socialYoutube: string;
  socialYoutubeEnabled: boolean;
  socialLinkedin: string;
  socialLinkedinEnabled: boolean;
  socialTiktok: string;
  socialTiktokEnabled: boolean;
  socialSpotify: string;
  socialSpotifyEnabled: boolean;
  socialSubstack: string;
  socialSubstackEnabled: boolean;
  seoTitleDefault: string;
  seoDescriptionDefault: string;
  ogImageDefault: string;
};

function toFormState(initial: SiteSetting | null): FormState {
  return {
    logoUrl: initial?.logoUrl ?? "",
    logoMobileUrl: initial?.logoMobileUrl ?? "",
    faviconUrl: initial?.faviconUrl ?? "",
    aboutImageUrl: initial?.aboutImageUrl ?? "",
    aboutLeadTr: initial?.aboutLeadTr ?? "",
    aboutLeadEn: initial?.aboutLeadEn ?? "",
    aboutBodyTr: initial?.aboutBodyTr ?? "",
    aboutBodyEn: initial?.aboutBodyEn ?? "",
    address: initial?.address ?? "",
    phone: initial?.phone ?? "",
    email: initial?.email ?? "",
    whatsapp: initial?.whatsapp ?? "",
    whatsappEnabled: initial?.whatsappEnabled ?? true,
    workingHours: initial?.workingHours ?? "",
    mapEmbedUrl: initial?.mapEmbedUrl ?? "",
    socialInstagram: initial?.socialInstagram ?? "",
    socialInstagramEnabled: initial?.socialInstagramEnabled ?? true,
    socialFacebook: initial?.socialFacebook ?? "",
    socialFacebookEnabled: initial?.socialFacebookEnabled ?? false,
    socialX: initial?.socialX ?? "",
    socialXEnabled: initial?.socialXEnabled ?? false,
    socialYoutube: initial?.socialYoutube ?? "",
    socialYoutubeEnabled: initial?.socialYoutubeEnabled ?? false,
    socialLinkedin: initial?.socialLinkedin ?? "",
    socialLinkedinEnabled: initial?.socialLinkedinEnabled ?? false,
    socialTiktok: initial?.socialTiktok ?? "",
    socialTiktokEnabled: initial?.socialTiktokEnabled ?? false,
    socialSpotify: initial?.socialSpotify ?? "",
    socialSpotifyEnabled: initial?.socialSpotifyEnabled ?? false,
    socialSubstack: initial?.socialSubstack ?? "",
    socialSubstackEnabled: initial?.socialSubstackEnabled ?? false,
    seoTitleDefault: initial?.seoTitleDefault ?? "",
    seoDescriptionDefault: initial?.seoDescriptionDefault ?? "",
    ogImageDefault: initial?.ogImageDefault ?? "",
  };
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-foreground/70">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
      />
    </div>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-foreground/70">{label}</label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
      />
    </div>
  );
}

function SocialField({
  label,
  icon: Icon,
  enabled,
  onToggle,
  value,
  onChange,
}: {
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <label className="flex w-40 shrink-0 items-center gap-2 text-sm font-medium text-foreground/70">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(event) => onToggle(event.target.checked)}
        />
        <Icon size={18} />
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={!enabled}
        placeholder={enabled ? "https://..." : "Kapalı"}
        className="w-full rounded-md border border-black/10 px-3 py-2 text-sm disabled:bg-black/[0.03] disabled:text-foreground/40"
      />
    </div>
  );
}

export function SettingsForm({ initial }: { initial: SiteSetting | null }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(toFormState(initial));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");

    const response = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);
    if (!response.ok) {
      setError("Kaydedilemedi. Lütfen tekrar deneyin.");
      return;
    }

    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-lg border border-black/5 bg-white p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground/50">
          Logo &amp; Favicon
        </h3>
        <ImageUploadField
          label="Logo (Masaüstü / Tablet)"
          value={form.logoUrl}
          onChange={(url) => set("logoUrl", url)}
          // Varsayılan kare önizleme (object-cover) logoyu kırpıyordu; kutu
          // logonun ≈2.45:1 oranıyla aynı.
          previewClassName="relative h-16 w-[157px] shrink-0 overflow-hidden rounded border border-black/10 bg-black/[0.02]"
          hint={imageSizeHint(IMAGE_SIZES.siteLogo)}
        />
        <ImageUploadField
          label="Logo (Mobil — boş bırakılırsa masaüstü logosu kullanılır)"
          value={form.logoMobileUrl}
          onChange={(url) => set("logoMobileUrl", url)}
          previewClassName="relative h-11 w-[108px] shrink-0 overflow-hidden rounded border border-black/10 bg-black/[0.02]"
          hint={imageSizeHint(IMAGE_SIZES.siteLogoMobile)}
        />
        <ImageUploadField
          label="Favicon"
          value={form.faviconUrl}
          onChange={(url) => set("faviconUrl", url)}
          hint={imageSizeHint(IMAGE_SIZES.favicon)}
        />
      </section>

      <section className="flex flex-col gap-4 rounded-lg border border-black/5 bg-white p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground/50">
          Hakkımızda İçeriği
        </h3>
        <p className="text-sm text-foreground/50">
          Kısa özet ve görsel ana sayfadaki Hakkımızda bölümünde birlikte gösterilir; tam metin
          sadece /kitabevi/hakkimizda sayfasında (görselsiz, tam metin olarak) görünür.
          Boş bırakılan alanlar, panelden hiç düzenleme yapılmamış gibi varsayılan içeriğe düşer.
        </p>
        <ImageUploadField
          label="Hakkımızda Görseli"
          value={form.aboutImageUrl}
          onChange={(url) => set("aboutImageUrl", url)}
          hint={imageSizeHint(IMAGE_SIZES.aboutImage)}
          previewClassName="relative h-24 aspect-3/4 shrink-0 overflow-hidden rounded border border-black/10 bg-black/[0.02]"
        />
        <div className="grid grid-cols-2 gap-4">
          <TextareaField
            label="Kısa Özet (TR)"
            value={form.aboutLeadTr}
            onChange={(v) => set("aboutLeadTr", v)}
            rows={2}
          />
          <TextareaField
            label="Kısa Özet (EN)"
            value={form.aboutLeadEn}
            onChange={(v) => set("aboutLeadEn", v)}
            rows={2}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <TextareaField
            label="Tam Metin (TR, Markdown)"
            value={form.aboutBodyTr}
            onChange={(v) => set("aboutBodyTr", v)}
            rows={8}
            placeholder="Paragraflar arasında boş satır bırakın. _italik_ ve **kalın** desteklenir."
          />
          <TextareaField
            label="Tam Metin (EN, Markdown)"
            value={form.aboutBodyEn}
            onChange={(v) => set("aboutBodyEn", v)}
            rows={8}
            placeholder="Leave a blank line between paragraphs. _italic_ and **bold** supported."
          />
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-lg border border-black/5 bg-white p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground/50">
          İletişim Bilgileri
        </h3>
        <TextField label="Adres" value={form.address} onChange={(v) => set("address", v)} />
        <TextField label="Telefon" value={form.phone} onChange={(v) => set("phone", v)} />
        <TextField label="E-posta" value={form.email} onChange={(v) => set("email", v)} />
        <TextField
          label="Çalışma Saatleri"
          value={form.workingHours}
          onChange={(v) => set("workingHours", v)}
        />
        <TextField
          label="Google Maps Embed URL"
          value={form.mapEmbedUrl}
          onChange={(v) => set("mapEmbedUrl", v)}
        />
      </section>

      <section className="flex flex-col gap-4 rounded-lg border border-black/5 bg-white p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground/50">
          Sosyal Medya
        </h3>
        <p className="text-sm text-foreground/50">
          Kutucuğu işaretlemek platformu sitede aktif eder; işaretli değilse (veya adres boşsa)
          hiçbir yerde görünmez.
        </p>
        <SocialField
          label="Instagram"
          icon={InstagramIcon}
          enabled={form.socialInstagramEnabled}
          onToggle={(v) => set("socialInstagramEnabled", v)}
          value={form.socialInstagram}
          onChange={(v) => set("socialInstagram", v)}
        />
        <SocialField
          label="WhatsApp"
          icon={WhatsappIcon}
          enabled={form.whatsappEnabled}
          onToggle={(v) => set("whatsappEnabled", v)}
          value={form.whatsapp}
          onChange={(v) => set("whatsapp", v)}
        />
        <SocialField
          label="Facebook"
          icon={FacebookIcon}
          enabled={form.socialFacebookEnabled}
          onToggle={(v) => set("socialFacebookEnabled", v)}
          value={form.socialFacebook}
          onChange={(v) => set("socialFacebook", v)}
        />
        <SocialField
          label="X (Twitter)"
          icon={TwitterIcon}
          enabled={form.socialXEnabled}
          onToggle={(v) => set("socialXEnabled", v)}
          value={form.socialX}
          onChange={(v) => set("socialX", v)}
        />
        <SocialField
          label="LinkedIn"
          icon={LinkedinIcon}
          enabled={form.socialLinkedinEnabled}
          onToggle={(v) => set("socialLinkedinEnabled", v)}
          value={form.socialLinkedin}
          onChange={(v) => set("socialLinkedin", v)}
        />
        <SocialField
          label="TikTok"
          icon={TiktokIcon}
          enabled={form.socialTiktokEnabled}
          onToggle={(v) => set("socialTiktokEnabled", v)}
          value={form.socialTiktok}
          onChange={(v) => set("socialTiktok", v)}
        />
        <SocialField
          label="YouTube"
          icon={YoutubeIcon}
          enabled={form.socialYoutubeEnabled}
          onToggle={(v) => set("socialYoutubeEnabled", v)}
          value={form.socialYoutube}
          onChange={(v) => set("socialYoutube", v)}
        />
        <SocialField
          label="Spotify"
          icon={SpotifyIcon}
          enabled={form.socialSpotifyEnabled}
          onToggle={(v) => set("socialSpotifyEnabled", v)}
          value={form.socialSpotify}
          onChange={(v) => set("socialSpotify", v)}
        />
        <SocialField
          label="Substack"
          icon={SubstackIcon}
          enabled={form.socialSubstackEnabled}
          onToggle={(v) => set("socialSubstackEnabled", v)}
          value={form.socialSubstack}
          onChange={(v) => set("socialSubstack", v)}
        />
      </section>

      <section className="flex flex-col gap-4 rounded-lg border border-black/5 bg-white p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground/50">
          Site Geneli SEO Varsayılanları
        </h3>
        <TextField
          label="Varsayılan SEO Başlığı"
          value={form.seoTitleDefault}
          onChange={(v) => set("seoTitleDefault", v)}
        />
        <TextField
          label="Varsayılan Meta Açıklama"
          value={form.seoDescriptionDefault}
          onChange={(v) => set("seoDescriptionDefault", v)}
        />
        <ImageUploadField
          label="Varsayılan OG Görseli"
          value={form.ogImageDefault}
          onChange={(url) => set("ogImageDefault", url)}
          hint={imageSizeHint(IMAGE_SIZES.ogImageDefault)}
          warning={IMAGE_SIZES.ogImageDefault.warning}
        />
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-brand-primary px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </button>
        {saved && <p className="text-sm text-green-700">Kaydedildi.</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </form>
  );
}
