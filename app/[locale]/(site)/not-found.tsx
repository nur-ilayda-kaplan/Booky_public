import Link from "next/link";
import tr from "@/locales/tr.json";
import en from "@/locales/en.json";

// Next's not-found boundary for a dynamic [locale] segment does not reliably
// receive the requested locale (only the "first" static param resolves
// correctly), so this page shows both languages rather than guessing wrong.
export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="font-serif text-6xl font-semibold text-brand-primary">
        404
      </p>
      <h1 className="mt-4 font-serif text-2xl font-semibold">
        {tr.notFound.title} / {en.notFound.title}
      </h1>
      <p className="mt-2 text-foreground/60">{tr.notFound.message}</p>
      <p className="text-foreground/60">{en.notFound.message}</p>
      <Link
        href="/"
        className="mt-8 rounded-md bg-brand-primary px-6 py-3 text-base font-semibold text-white hover:opacity-90"
      >
        {tr.notFound.backHome} / {en.notFound.backHome}
      </Link>
    </div>
  );
}
