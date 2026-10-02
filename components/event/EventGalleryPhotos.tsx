import Image from "next/image";
import type { EventGalleryItem } from "@/types";

// "Kimler Geldi?" fotoğrafları: etkinlik detay sayfasında (etkinliğe bağlı
// galeri varsa) ve /kitabevi/kimler-geldi/[id] galeri sayfasında. Her
// fotoğraf yeni sekmede tam boyutta açılır.
export function EventGalleryPhotos({
  gallery,
  title,
  alt,
}: {
  gallery: EventGalleryItem;
  title?: string;
  alt: string;
}) {
  return (
    <section className={title ? "mt-12" : "mt-8"}>
      {title && <h2 className="font-serif text-2xl text-lacivert">{title}</h2>}
      {gallery.note && (
        <p className="mt-2 whitespace-pre-line font-accent text-[17px] font-medium italic text-lacivert/80">
          {gallery.note}
        </p>
      )}
      <div className={`${title || gallery.note ? "mt-6" : ""} grid grid-cols-2 gap-3 sm:grid-cols-3`}>
        {gallery.images.map((src, index) => (
          <a
            key={`${src}-${index}`}
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="relative aspect-[4/5] overflow-hidden rounded-[12px] bg-brand-accent/20"
          >
            <Image
              src={src}
              alt={`${alt} — ${index + 1}`}
              fill
              sizes="(min-width: 768px) 240px, 45vw"
              className="object-cover transition duration-300 hover:scale-105"
            />
          </a>
        ))}
      </div>
    </section>
  );
}
