import Image from "next/image";
import type { Guest } from "@/types";
import type { Dictionary } from "@/lib/getDictionary";

export function GuestCard({ guest, dict }: { guest: Guest; dict: Dictionary }) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-black/5 bg-white p-5 text-center">
      <div className="relative h-24 w-24 overflow-hidden rounded-full bg-brand-accent/20">
        <Image src={guest.photo} alt={guest.name} fill sizes="96px" className="object-cover" />
      </div>
      <h3 className="mt-3 font-serif text-base font-semibold">{guest.name}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-foreground/60">{guest.shortBio}</p>
      {guest.visitDate && (
        <span className="mt-2 text-sm font-medium text-brand-primary">
          {dict.guests.visitedLabel}: {guest.visitDate}
        </span>
      )}
    </div>
  );
}
