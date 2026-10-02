import Image from "next/image";
import type { Dictionary } from "@/lib/getDictionary";
import { HomeSection, HomeSectionHeading, HomeSectionLink } from "./HomeSection";

// Figma "Instagram" (2:419) gönderileri — şimdilik sabit görseller.
const POSTS = [1, 2, 3, 4, 5, 6].map((n) => `/images/home/instagram-${n}.jpg`);

// "https://www.instagram.com/bookykitabevi/" → "@bookykitabevi"
function instagramHandle(url: string): string {
  const handle = url.replace(/\/+$/, "").split("/").pop();
  return handle ? `@${handle.replace(/^@/, "")}` : "Instagram";
}

// Figma "ızgara" (2:425): 6 eşit sütun, 12px aralık, 190×238 gönderi, 4px köşe.
// Mobil (Figma 2:614): beyaz zemin, 3 sütun, 4px aralık, 114×142, köşesiz.
export function InstagramSection({
  dict,
  instagramUrl,
}: {
  dict: Dictionary;
  instagramUrl: string | null;
}) {
  if (!instagramUrl) return null;

  return (
    <HomeSection className="bg-white sm:bg-kagit">
      <HomeSectionHeading
        kicker={instagramHandle(instagramUrl)}
        uppercaseKicker={false}
        title={dict.home.instagramTitle}
        action={
          <HomeSectionLink href={instagramUrl} label={dict.home.instagramFollow} external />
        }
      />
      <div className="grid grid-cols-3 gap-[4px] sm:gap-[12px] lg:grid-cols-6">
        {POSTS.map((src) => (
          <a
            key={src}
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={dict.home.instagramTitle}
            className="group relative aspect-[190/238] overflow-hidden sm:rounded-[4px]"
          >
            <Image
              src={src}
              alt=""
              fill
              sizes="(min-width: 1024px) 190px, 33vw"
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          </a>
        ))}
      </div>
    </HomeSection>
  );
}
