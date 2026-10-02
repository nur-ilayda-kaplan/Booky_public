import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/formatDate";
import { localePath } from "@/lib/localePath";
import { authors } from "@/data/authors";
import type { BlogPost } from "@/types";
import type { Locale } from "@/config/i18n.config";

// Figma "yazı, …" (ör. 2:345): beyaz kart, 10px köşe, yumuşak gölge;
// 260px görsel, altında px-24 metin bloğu (12px aralık) ve pb-24.
// Mobil (Figma 2:579): 210px görsel, pt-18 px-18 metin (10px aralık), pb-20.
export function HomeBlogCard({ post, locale }: { post: BlogPost; locale: Locale }) {
  const authorName =
    post.authorName || authors.find((author) => author.id === post.authorId)?.name;
  const meta = [authorName, formatDate(post.publishedAt, locale)].filter(Boolean).join(", ");

  return (
    <Link
      href={localePath(locale, `/kitabevi/blog/${post.slug}`)}
      className="group flex flex-col overflow-hidden rounded-[10px] bg-white pb-[20px] shadow-[0px_8px_24px_0px_rgba(46,54,64,0.08)] sm:gap-[14px] sm:pb-[24px]"
    >
      <div className="relative h-[210px] w-full overflow-hidden bg-kagit sm:h-[260px]">
        {post.coverImage && (
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(min-width: 768px) 379px, 90vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        )}
      </div>
      <div className="flex flex-col gap-[10px] px-[18px] pt-[18px] sm:gap-[12px] sm:px-[24px] sm:pt-0">
        <h3 className="font-serif text-[22px] leading-[1.4] sm:text-[26px] text-lacivert group-hover:text-murdum">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="line-clamp-3 font-accent text-[16px] font-medium italic leading-[1.4] sm:text-[17px] text-lacivert/75">
            {post.excerpt}
          </p>
        )}
        <p className="text-[13px] font-bold leading-[1.255] text-murdum">{meta}</p>
      </div>
    </Link>
  );
}
