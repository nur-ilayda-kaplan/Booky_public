import { guests } from "@/data/guests";
import type { Guest } from "@/types";

export async function getGuests(): Promise<Guest[]> {
  return guests;
}

export async function getGuestBySlug(slug: string): Promise<Guest | undefined> {
  return guests.find((guest) => guest.slug === slug);
}
