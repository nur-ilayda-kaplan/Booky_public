import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { sendMail } from "../lib/email";

// SMTP ayarlarının doğru çalıştığını doğrulamak için kullanılır:
//   npm run email:test
//   npm run email:test -- baska-adres@ornek.com
async function main() {
  const to = process.argv[2] || process.env.CONTACT_FORM_TO || process.env.SMTP_USER;
  if (!to) {
    console.error(
      "Gönderilecek adres bulunamadı. .env'de CONTACT_FORM_TO/SMTP_USER tanımlı değil ve argüman verilmedi.\n" +
        "Kullanım: npm run email:test -- alici@ornek.com",
    );
    process.exit(1);
  }

  await sendMail({
    to,
    subject: "Booky — SMTP test e-postası",
    text: "Bu e-posta, .env dosyasındaki SMTP ayarlarının doğru çalıştığını doğrulamak için gönderildi.",
    html: "<p>Bu e-posta, <code>.env</code> dosyasındaki SMTP ayarlarının doğru çalıştığını doğrulamak için gönderildi.</p>",
  });

  console.log(`Test e-postası başarıyla gönderildi: ${to}`);
}

main().catch((error) => {
  console.error("Test e-postası gönderilemedi:", error);
  process.exit(1);
});
