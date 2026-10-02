import { prisma } from "../lib/prisma";
import { categories } from "../data/categories";
import { authors } from "../data/authors";
import { products } from "../data/products";
import { blogPosts } from "../data/blogPosts";
import { siteConfig } from "../config/site.config";

// One-time / re-runnable seed that copies the current static site content
// (data/*.ts, config/site.config.ts) into the new CMS tables so the admin
// panel has real starting data. Safe to re-run: every write is an upsert
// keyed by the same unique slug/id the static data already uses.

async function main() {
  console.log("CMS seed başlıyor...");

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { nameTr: category.name.tr, nameEn: category.name.en },
      create: { slug: category.slug, nameTr: category.name.tr, nameEn: category.name.en },
    });
  }
  console.log(`  ✔ ${categories.length} kategori`);

  for (const author of authors) {
    await prisma.author.upsert({
      where: { slug: author.slug },
      update: {
        name: author.name,
        photo: author.photo,
        shortBio: author.shortBio,
        bio: author.bio,
        socialInstagram: author.socials.instagram,
        socialTwitter: author.socials.twitter,
        socialWebsite: author.socials.website,
        spotifyPlaylistUrl: author.spotifyPlaylistUrl,
      },
      create: {
        slug: author.slug,
        name: author.name,
        photo: author.photo,
        shortBio: author.shortBio,
        bio: author.bio,
        socialInstagram: author.socials.instagram,
        socialTwitter: author.socials.twitter,
        socialWebsite: author.socials.website,
        spotifyPlaylistUrl: author.spotifyPlaylistUrl,
      },
    });
  }
  console.log(`  ✔ ${authors.length} yazar`);

  for (const product of products) {
    const author = authors.find((a) => a.id === product.authorId);
    const category = categories.find((c) => c.id === product.categoryId);

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        title: product.title,
        isbn: product.isbn,
        description: product.description,
        coverImage: product.coverImage,
        pageCount: product.pageCount,
        publishedYear: product.publishedYear,
        price: product.price,
        showPrice: true,
        featured: product.featured ?? false,
        status: "PUBLISHED",
        authorId: author ? (await prisma.author.findUnique({ where: { slug: author.slug } }))?.id : null,
        categoryId: category
          ? (await prisma.category.findUnique({ where: { slug: category.slug } }))?.id
          : null,
      },
      create: {
        slug: product.slug,
        title: product.title,
        isbn: product.isbn,
        description: product.description,
        coverImage: product.coverImage,
        pageCount: product.pageCount,
        publishedYear: product.publishedYear,
        price: product.price,
        showPrice: true,
        featured: product.featured ?? false,
        status: "PUBLISHED",
        authorId: author ? (await prisma.author.findUnique({ where: { slug: author.slug } }))?.id : null,
        categoryId: category
          ? (await prisma.category.findUnique({ where: { slug: category.slug } }))?.id
          : null,
      },
    });
  }
  console.log(`  ✔ ${products.length} kitap (satış linki eklenmedi — panelden eklenecek)`);

  for (const post of blogPosts) {
    const author = authors.find((a) => a.id === post.authorId);

    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        coverImage: post.coverImage,
        status: "PUBLISHED",
        publishedAt: new Date(post.publishedAt),
        authorId: author ? (await prisma.author.findUnique({ where: { slug: author.slug } }))?.id : null,
      },
      create: {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        coverImage: post.coverImage,
        status: "PUBLISHED",
        publishedAt: new Date(post.publishedAt),
        authorId: author ? (await prisma.author.findUnique({ where: { slug: author.slug } }))?.id : null,
      },
    });
  }
  console.log(`  ✔ ${blogPosts.length} blog yazısı`);

  await prisma.siteSetting.upsert({
    where: { id: "singleton" },
    update: {
      address: siteConfig.contact.address,
      phone: siteConfig.contact.phone,
      email: siteConfig.contact.email,
      whatsapp: siteConfig.social.whatsapp,
      socialInstagram: siteConfig.social.instagram,
    },
    create: {
      id: "singleton",
      address: siteConfig.contact.address,
      phone: siteConfig.contact.phone,
      email: siteConfig.contact.email,
      whatsapp: siteConfig.social.whatsapp,
      socialInstagram: siteConfig.social.instagram,
    },
  });
  console.log("  ✔ Genel ayarlar (SiteSetting)");

  console.log("CMS seed tamamlandı.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
