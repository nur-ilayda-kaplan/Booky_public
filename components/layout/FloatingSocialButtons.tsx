import type { SocialLink } from "@/lib/socialLinks";

// Instagram/WhatsApp ikonları (next/image tabanlı logo dosyaları) görsel
// olarak diğer ikonlardan daha fazla boşluk içeriyor, bu yüzden aynı
// buton içinde göze aynı büyüklükte görünmeleri için daha büyük render
// ediliyor. Yeni eklenen platformlar (inline SVG) için tek bir boyut
// yeterli. Boyutlar mobil içindir; masaüstünde lg:scale-125 ile büyür.
const ICON_SIZE: Record<string, number> = {
  Instagram: 24,
  WhatsApp: 29,
};

// Sağ kenara yapışık, dikeyde ortalı, ince ve yarı saydam sosyal medya
// şeridi; sağ alttaki "başa dön" butonuyla çakışmaz.
// - Masaüstü (lg+): ~44px genişliğiyle sayfa içeriğinin sağındaki 64px'lik
//   boşluğa (PageContainer lg:pr-16) sığar, hiçbir şeyin üstüne binmez.
// - Mobil: kenar boşluğu 16px olduğu için içeriğin kenarına biraz biner.
export function FloatingSocialButtons({
  links,
  label,
}: {
  links: SocialLink[];
  label: string;
}) {
  if (links.length === 0) return null;

  return (
    <nav
      aria-label={label}
      className="fixed right-0 top-1/2 z-30 -translate-y-1/2"
    >
      <ul className="flex flex-col gap-1 rounded-l-xl bg-white/60 p-0.5 opacity-90 shadow-md ring-1 ring-black/5 backdrop-blur-sm transition-opacity hover:opacity-100 lg:gap-1.5 lg:rounded-l-2xl lg:p-1">
        {links.map(({ href, label: platform, icon: Icon }) => (
          <li key={platform}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={platform}
              title={platform}
              className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition hover:scale-110 lg:h-9 lg:w-9"
            >
              <span className="flex lg:scale-125">
                <Icon size={ICON_SIZE[platform] ?? 16} />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
