import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { getBlogPostBySlug } from "@/lib/services/blog";
import { siteConfig } from "@/config/site.config";
import { isLocale } from "@/config/i18n.config";
import { getDictionary } from "@/lib/getDictionary";

// Instagram hikâyesi için 1080×1920 paylaşım görseli. Sadece yayındaki
// yazılar için üretilir (getBlogPostBySlug taslakları döndürmez).
// next/og (satori) WebP okuyamadığı ve admin'den WebP kapak yüklenebildiği
// için kapak sharp ile PNG'ye çevrilir; fontlar TTF olmak zorunda
// (assets/fonts, next.config.ts'teki outputFileTracingIncludes ile pakete girer).

export const runtime = "nodejs";

const WIDTH = 1080;
const HEIGHT = 1920;
const PADDING_X = 80;

// Kapak, yazı sayfasındakiyle (aspect-16/9 + object-cover, ortalı) birebir
// aynı kadrajla kırpılır; sitede iyi görünen fotoğraf hikâyede de öyle görünür.
const COVER_WIDTH = WIDTH - PADDING_X * 2;
const COVER_HEIGHT = Math.round((COVER_WIDTH * 9) / 16);

// Instagram hikâyesinde üstte profil/ilerleme çubuğu, altta yanıt kutusu
// içeriğin üstüne biner; bu bölgelere yazı konmaz.
const SAFE_TOP = 240;
const SAFE_BOTTOM = 240;

const COLORS = {
  primary: "#5b3a29",
  secondary: "#c9a876",
  accent: "#e8dfc8",
  background: "#fcfbf9",
  foreground: "#241c15",
};

function fromRoot(...segments: string[]) {
  return path.join(process.cwd(), ...segments);
}

async function loadCoverPng(src: string): Promise<string | null> {
  if (!src) return null;
  try {
    let input: Buffer;
    if (src.startsWith("/")) {
      // public/ altındaki yerel görsel; ".." ile dışarı çıkmaya izin verme.
      const filePath = path.normalize(fromRoot("public", src));
      if (!filePath.startsWith(fromRoot("public"))) return null;
      input = await readFile(filePath);
    } else if (src.startsWith("https://")) {
      const response = await fetch(src);
      if (!response.ok) return null;
      input = Buffer.from(await response.arrayBuffer());
    } else {
      return null;
    }
    // 2x çözünürlükte kırpılır ki telefonda keskin görünsün.
    const png = await sharp(input)
      .resize(COVER_WIDTH * 2, COVER_HEIGHT * 2, {
        fit: "cover",
        position: "centre",
      })
      .png()
      .toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    return null;
  }
}

async function loadLogo(): Promise<string> {
  const svg = await readFile(fromRoot("public", siteConfig.logo));
  return `data:image/svg+xml;base64,${svg.toString("base64")}`;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) {
    return new Response("Not found", { status: 404 });
  }

  const localeParam = new URL(request.url).searchParams.get("locale") ?? "tr";
  const locale = isLocale(localeParam) ? localeParam : "tr";
  const dict = getDictionary(locale);

  const [cover, logo, playfairBold, josefinRegular, josefinSemiBold] =
    await Promise.all([
      loadCoverPng(post.coverImage),
      loadLogo(),
      readFile(fromRoot("assets/fonts/PlayfairDisplay-Bold.ttf")),
      readFile(fromRoot("assets/fonts/JosefinSans-Regular.ttf")),
      readFile(fromRoot("assets/fonts/JosefinSans-SemiBold.ttf")),
    ]);

  const siteHost = new URL(siteConfig.url).host.replace(/^www\./, "");
  const titleSize =
    post.title.length > 70 ? 68 : post.title.length > 40 ? 80 : 92;

  return new ImageResponse(
    <div
      style={{
        width: WIDTH,
        height: HEIGHT,
        display: "flex",
        flexDirection: "column",
        padding: `${SAFE_TOP}px ${PADDING_X}px ${SAFE_BOTTOM}px`,
        backgroundColor: COLORS.accent,
        fontFamily: "Josefin Sans",
      }}
    >
      {/* Kapak ve metin, güvenli alan içinde dikeyde ortalanır; logo satırı en altta. */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            width: COVER_WIDTH,
            height: COVER_HEIGHT,
            borderRadius: 28,
            overflow: "hidden",
            backgroundColor: COLORS.background,
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 24px 48px rgba(36, 28, 21, 0.18)",
          }}
        >
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              width={COVER_WIDTH}
              height={COVER_HEIGHT}
              alt=""
              style={{ borderRadius: 28 }}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} width={440} height={180} alt="" />
          )}
        </div>

        <div
          style={{
            marginTop: 80,
            fontSize: 32,
            fontWeight: 600,
            letterSpacing: 6,
            color: COLORS.primary,
            opacity: 0.7,
          }}
        >
          BOOKY BLOG
        </div>
        <div
          style={{
            marginTop: 28,
            fontFamily: "Playfair Display",
            fontSize: titleSize,
            fontWeight: 700,
            lineHeight: 1.15,
            color: COLORS.primary,
            display: "block",
            lineClamp: 5,
          }}
        >
          {post.title}
        </div>
        {post.authorName && (
          <div
            style={{
              marginTop: 40,
              fontSize: 40,
              color: COLORS.foreground,
              opacity: 0.7,
            }}
          >
            {`${dict.blog.by} ${post.authorName}`}
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} width={240} height={98} alt="" />
        <div style={{ fontSize: 34, fontWeight: 600, color: COLORS.primary }}>
          {siteHost}
        </div>
      </div>
    </div>,
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        {
          name: "Playfair Display",
          data: playfairBold,
          weight: 700,
          style: "normal",
        },
        {
          name: "Josefin Sans",
          data: josefinRegular,
          weight: 400,
          style: "normal",
        },
        {
          name: "Josefin Sans",
          data: josefinSemiBold,
          weight: 600,
          style: "normal",
        },
      ],
      headers: {
        "Cache-Control":
          "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
