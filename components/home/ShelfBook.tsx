import Image from "next/image";
import Link from "next/link";

// Figma "Seri / Kitap" bileşeni: 150×225 kapak, arkasında iki katman sayfa
// kenarı (5px/3px sağa kaymış), kapak üstünde sırt gölgesi ve ışık
// gradyanları; altında 11px aralıkla başlık ve yazar. Mobilde (Figma 2:514)
// aynı bileşen 140px genişlikte — tüm ölçüler 140/150 oranında.
export function ShelfBook({
  href,
  title,
  authorName,
  coverImage,
}: {
  href: string;
  title: string;
  authorName?: string;
  coverImage?: string;
}) {
  return (
    <Link href={href} className="group relative flex w-[140px] shrink-0 flex-col gap-[10.267px] sm:w-[150px] sm:gap-[11px]">
      <div
        aria-hidden="true"
        className="absolute left-[4.67px] top-[2.8px] h-[205.333px] w-[140px] rounded-r-[2.333px] bg-[#e5e0d4] sm:left-[5px] sm:top-[3px] sm:h-[220px] sm:w-[150px] sm:rounded-r-[2.5px]"
      />
      <div
        aria-hidden="true"
        className="absolute left-[2.8px] top-[1.4px] h-[207.2px] w-[140px] rounded-r-[2.333px] sm:left-[3px] sm:top-[1.5px] sm:h-[222px] sm:w-[150px] sm:rounded-r-[2.5px]"
        style={{
          backgroundImage: "linear-gradient(to right, #f7f5ed 0%, #f7f5ed 97%, #dbd6c9 100%)",
        }}
      />
      <div className="relative h-[210px] w-[140px] overflow-hidden rounded-l-[0.933px] rounded-r-[2.333px] bg-brand-accent shadow-[0.933px_1.867px_2.8px_0px_rgba(31,33,41,0.22),0px_11.2px_18.667px_-6px_rgba(31,33,41,0.18)] transition-transform sm:h-[225px] sm:w-[150px] sm:rounded-l-[1px] sm:rounded-r-[2.5px] sm:shadow-[1px_2px_3px_0px_rgba(31,33,41,0.22),0px_12px_20px_-6px_rgba(31,33,41,0.18)] duration-300 group-hover:-translate-y-1">
        {coverImage && (
          <Image src={coverImage} alt={title} fill sizes="(min-width: 640px) 150px, 140px" className="object-cover" />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-[14px] sm:w-[15px]"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.1) 22%, rgba(255, 255, 255, 0.22) 34%, rgba(255, 255, 255, 0) 50%, rgba(0, 0, 0, 0) 100%)",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(123.69deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 35.714%, rgba(0, 0, 0, 0.06) 71.429%)",
          }}
        />
      </div>
      <p className="relative font-serif text-[16.8px] leading-[1.12] sm:text-[18px] text-lacivert group-hover:text-murdum">
        {title}
      </p>
      {authorName && (
        <p className="relative text-[10.27px] font-semibold sm:text-[11px] leading-[1.255] text-murdum">{authorName}</p>
      )}
    </Link>
  );
}
