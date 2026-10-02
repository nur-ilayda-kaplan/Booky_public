import { NextResponse } from "next/server";
import { sendMail } from "@/lib/email";
import { verifyRecaptcha } from "@/lib/recaptcha";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const recaptchaToken = typeof body?.recaptchaToken === "string" ? body.recaptchaToken : "";

  if (!name || !email || !email.includes("@") || !phone || !message) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  // Spam botlarına karşı — form gönderilmeden önce tarayıcıda doldurulan
  // reCAPTCHA widget'ının token'ı burada Google'a doğrulatılır (bkz.
  // lib/recaptcha.ts, components/forms/ContactForm.tsx).
  const remoteIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const recaptchaValid = await verifyRecaptcha(recaptchaToken, remoteIp);
  if (!recaptchaValid) {
    return NextResponse.json({ error: "RECAPTCHA_FAILED" }, { status: 400 });
  }

  const to = process.env.CONTACT_FORM_TO || process.env.SMTP_USER || "";
  if (!to) {
    console.error("Contact form: CONTACT_FORM_TO/SMTP_USER is not configured.");
    return NextResponse.json({ error: "EMAIL_NOT_CONFIGURED" }, { status: 500 });
  }

  try {
    await sendMail({
      to,
      replyTo: `"${name}" <${email}>`,
      subject: `İletişim formu: ${name}`,
      text: `İsim: ${name}\nE-posta: ${email}\nTelefon: ${phone}\n\nMesaj:\n${message}`,
      html: `
        <p><strong>İsim:</strong> ${escapeHtml(name)}</p>
        <p><strong>E-posta:</strong> ${escapeHtml(email)}</p>
        <p><strong>Telefon:</strong> ${escapeHtml(phone)}</p>
        <p><strong>Mesaj:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
      `,
    });
  } catch (error) {
    console.error("Contact form email failed to send", error);
    return NextResponse.json({ error: "SEND_FAILED" }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
