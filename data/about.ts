// "Hakkımızda" sayfasının (app/[locale]/(site)/kitabevi/hakkimizda/page.tsx) ve
// ana sayfadaki teaser bölümünün paylaştığı içerik — tek bir yerde tutulur ki
// biri güncellenince diğeri unutulmasın.
export const aboutContent = {
  tr: {
    lead: "Booky, kitapların yalnızca raflarda değil, hayatın içinde yaşaması gerektiğine inanan bir kitabevi.",
    paragraphs: [
      `2022 yılında kurulan Booky Kitabevi; okurları, yazarları ve farklı disiplinlerden üreticileri bir araya getiren yaşayan bir kültür alanı olma fikriyle yola çıktı. Kitap kulüpleri, yazar buluşmaları, söyleşiler ve atölyelerle edebiyatın etrafında paylaşan, tartışan ve birlikte üreten bir topluluk oluşturmayı amaçlıyor.`,
      `Bizim için kitap, okunduğu yerde bitmez; konuşuldukça, paylaşıldıkça ve yeni karşılaşmalara alan açtıkça yaşamaya devam eder.`,
    ],
    closing: "Booky — kitapların insanlarla, insanların birbirleriyle buluştuğu yer.",
  },
  en: {
    lead: "Booky is a bookstore that believes books belong not just on shelves, but in the midst of life.",
    paragraphs: [
      `Founded in 2022, Booky Kitabevi set out with the idea of becoming a living cultural space that brings together readers, writers, and creators from different disciplines. Through book clubs, author meetups, talks and workshops, it aims to build a community that shares, discusses and creates together around literature.`,
      `For us, a book doesn't end where it's read — it keeps living as it's discussed, shared, and opens space for new encounters.`,
    ],
    closing: "Booky — the place where books meet people, and people meet each other.",
  },
} as const;
