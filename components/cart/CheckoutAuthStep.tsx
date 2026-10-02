import Link from "next/link";
import { localePath } from "@/lib/localePath";
import type { Locale } from "@/config/i18n.config";
import type { Dictionary } from "@/lib/getDictionary";

export function CheckoutAuthStep({
  locale,
  dict,
  onContinueAsGuest,
}: {
  locale: Locale;
  dict: Dictionary;
  onContinueAsGuest: () => void;
}) {
  const callbackUrl = encodeURIComponent(localePath(locale, "/checkout"));

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-black/5 bg-white p-5">
      <h2 className="font-serif text-lg font-semibold">{dict.checkout.chooseHowToContinue}</h2>
      <Link
        href={`${localePath(locale, "/giris-yap")}?callbackUrl=${callbackUrl}`}
        className="rounded-md bg-brand-primary px-4 py-3 text-center text-base font-semibold text-white transition hover:opacity-90"
      >
        {dict.auth.login}
      </Link>
      <Link
        href={`${localePath(locale, "/uye-ol")}?callbackUrl=${callbackUrl}`}
        className="rounded-md border border-brand-primary px-4 py-3 text-center text-base font-semibold text-brand-primary transition hover:bg-brand-primary hover:text-white"
      >
        {dict.auth.register}
      </Link>
      <button
        type="button"
        onClick={onContinueAsGuest}
        className="rounded-md px-4 py-3 text-center text-base font-medium text-foreground/70 underline-offset-2 hover:underline"
      >
        {dict.checkout.continueAsGuest}
      </button>
    </div>
  );
}
