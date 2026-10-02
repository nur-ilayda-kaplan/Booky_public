import { prisma } from "../lib/prisma";
import { slugify } from "../lib/slugify";

// Kullanıcının verdiği ham isim listeleri — sadece `name` dolduruluyor,
// slug isimden türetiliyor. photo/shortBio/bio/sosyal medya alanları BOŞ
// bırakılır; bunlar admin panelden (/admin/authors) elle doldurulacak.
const ADULT_AUTHORS_RAW = `Aslı Perker, Bahar Eriş, Hilal Bebek, Kürşat Başar, Vedat Ozan, Kaan Sekban, Aslıhan Kaya, Can Göknil, Hilal Çorbacıoğlu, Yıldız Cüceloğlu, Özgür Özgülgün, Melda Kamhi Kosif, Ege, Erhan Ali Yılmaz, Melis Aygen, Şule Funda Polat, Orhan Bahtiyar, Melisa Kesmez, Emir Mavitan, Doğu Yücel, Vera Caenalgtanati, Gülnur Ünal, Ece Özbaş, Ece Erdoğuş Levi, Dilvin Gerçek, İrem Uzunhasanoğlu, Melike İlgün, Nihan Uycan Özen, Lütfiye Pekcan, Sibel Oral, Işık Öğütçü, Ege Soley, Saadettin Eskiçorapçı, Mehmet Sinan Kuran, Ayşe Övür, Selcen Gür, Ahmet Uygur, İdil Sevil, Hikmet Hükümenoğlu, Tolga Örnek, Alper Canıgüz, Fuat Sevimay, Aslı Tohumcu, Sinan Akyüz, Mümin Sekman, Mine Söğüt, Nermin Bezmen, Semih Öztürk, Dalia Maya, Gökçe Bilgin, Figen Şakacı, İclal Aydın, Tarık Tufan, Deniz Yüce Başarır, Ceyda Ceylan Kortak, Fuat Sami&Mert Sakallıoğlu, Neslihan Önderoğlu, Sinem Sal, Burcu Arkut Acun, Melis Alphan, Buket Uzuner, Deniz Akkaya, Ayşe Erbulak, Sevinç Erbulak, Oktar Asoğlu, Zeynep Göğüş, Suna Dumankaya, Ebru Uygun, Mesut Demirbilek, Çağla Ural, Tolga Gümüşay, Seray Şahiner, Nazlı Yiğit Büyüksoy, Başak Sayan, Ayça Derin Karabulut, Afşin Kum, Irmak Zileli, Tuna Kiremitçi, Müge Murat, Fatma Burçak, Defne Suman, Tuğçe Isıyel, Başar Başarır, Saygın Ersin, Hakan Bıçakçı, Balçiçek İlter, Özgür Mumcu, Gülhan Davarcı, Ferhat Uludere, Bige Güven Kızılay, Mert Ofluoğlu, Hakan Kırkoğlu, Şila Servet Yıldız, Pelin Bozkurt Bilgiç, Şebnem İşigüzel, Muammer Yanmaz, Kerem Dündar, Beril Tokcan, Yekta Kopan, İlkay Yıldız, Ayşe Kulin, Gökçe Bilgin, İzel Rozental`;

const CHILDREN_AUTHORS_RAW = `Songül Bozacı, Ceylan Oğuzcan, Ebru Danyal, Özge Lokmanhekim, Tülin Kozikoğlu, Merve Başcumalı, Can Göknil, Kardelen Özdemir, Aslı Perker, Hafize Çınar, Cansu Dinçart, Murat Celep, Melike Kapıcıoğlu, Öznur Sönmez, Ayşegül Babalı, Şimal Gürtekin, Gizem Balata, Zeynep Birsin, Esra Uçmak, Ece Erdoğuş Levi, Zeynep Alpaslan, Seren Karabatan, Göknil Özkök, Defne Ongun, Aslı Tohumcu`;

// Kullanıcının kendisinin örnek olarak işaret ettiği, otomatik bir desenle
// (ayraç, vs.) yakalanamayan şüpheli/yazım hatası gibi duran giriş. Silinmez
// veya düzeltilmez — sadece DB'ye yazılmadan "gözden geçir" listesine düşer.
const MANUALLY_FLAGGED_NORMALIZED = new Set<string>(["vera caenalgtanati"]);

function normalize(raw: string): string {
  return raw.toLocaleLowerCase("tr-TR").trim().replace(/\s+/g, " ");
}

// "&" veya " ve " ile birleşmiş iki isim, "/" ile ayrılmış girdiler, ya da
// elle işaretlenmiş şüpheli isimler — bunları sessizce bölüp düzeltmek yerine
// olduğu gibi bırakıp ayrı bir raporla bildiriyoruz.
function isSuspicious(raw: string): boolean {
  if (/[&/]/.test(raw)) return true;
  if (/\bve\b/i.test(raw)) return true;
  return MANUALLY_FLAGGED_NORMALIZED.has(normalize(raw));
}

function parseList(raw: string): string[] {
  return raw
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);
}

type SuspiciousEntry = { raw: string; sources: string[]; note?: string };
type NormalizedEntry = { name: string; normalized: string; sources: Set<string>; occurrences: number };

async function main() {
  const lists: { source: string; names: string[] }[] = [
    { source: "yetişkin edebiyatı", names: parseList(ADULT_AUTHORS_RAW) },
    { source: "çocuk edebiyatı", names: parseList(CHILDREN_AUTHORS_RAW) },
  ];
  const totalRaw = lists.reduce((sum, list) => sum + list.names.length, 0);

  const suspiciousIndex = new Map<string, { raw: string; sources: Set<string> }>();
  const byNormalized = new Map<string, NormalizedEntry>();

  for (const { source, names } of lists) {
    for (const raw of names) {
      const key = normalize(raw);
      if (isSuspicious(raw)) {
        const existing = suspiciousIndex.get(key);
        if (existing) existing.sources.add(source);
        else suspiciousIndex.set(key, { raw, sources: new Set([source]) });
        continue;
      }
      const existing = byNormalized.get(key);
      if (existing) {
        existing.occurrences += 1;
        existing.sources.add(source);
      } else {
        byNormalized.set(key, { name: raw, normalized: key, sources: new Set([source]), occurrences: 1 });
      }
    }
  }

  const suspicious: SuspiciousEntry[] = [...suspiciousIndex.values()].map((s) => ({
    raw: s.raw,
    sources: [...s.sources],
  }));

  const duplicatesMergedCount = [...byNormalized.values()].reduce(
    (sum, entry) => sum + (entry.occurrences - 1),
    0,
  );

  const usedSlugs = new Map<string, string>(); // slug -> bu çalıştırmada onu üreten normalize isim
  let created = 0;
  let matchedExisting = 0;

  for (const entry of byNormalized.values()) {
    const slug = slugify(entry.name) || `yazar-${Date.now()}`;

    // Aynı çalıştırma içinde farklı iki isim aynı slug'a düşerse (ör. ASCII'ye
    // indirgenince çakışma), sessizce birleştirmek yerine gözden geçirme
    // listesine taşınır.
    const slugOwner = usedSlugs.get(slug);
    if (slugOwner && slugOwner !== entry.normalized) {
      suspicious.push({ raw: entry.name, sources: [...entry.sources], note: `slug çakışması: "${slug}"` });
      continue;
    }
    usedSlugs.set(slug, entry.normalized);

    const existingBySlug = await prisma.author.findUnique({ where: { slug } });
    if (existingBySlug) {
      matchedExisting += 1;
      continue;
    }

    await prisma.author.create({ data: { name: entry.name, slug } });
    created += 1;
  }

  console.log("=== Yazar İçe Aktarma Özeti ===");
  console.log(`Toplam ham isim (iki liste birlikte): ${totalRaw}`);
  console.log(`Gözden geçirilmesi gereken (DB'ye yazılmadı): ${suspicious.length}`);
  console.log(`Tekilleştirilen fazladan tekrar (liste içi/arası): ${duplicatesMergedCount}`);
  console.log(`Yeni oluşturulan kayıt: ${created}`);
  console.log(`Zaten var olan bir slug'a eşleşen (dokunulmadı): ${matchedExisting}`);

  if (suspicious.length) {
    console.log("\nGözden geçirilmesi gereken girdiler:");
    for (const s of suspicious) {
      console.log(`  - "${s.raw}" (${s.sources.join(", ")})${s.note ? ` — ${s.note}` : ""}`);
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
