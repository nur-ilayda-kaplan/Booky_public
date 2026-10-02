import nodemailer, { type Transporter } from "nodemailer";

export type MailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

let cachedTransport: Transporter | null | undefined;

// SMTP_HOST/PORT/USER/PASSWORD .env'den okunur (bkz. .env.example). Bunlardan
// biri eksikse (örn. yerel geliştirmede henüz ayarlanmamışsa) transport
// oluşturulmaz — sendMail bunu net bir hata olarak fırlatır, sessizce
// başarılı gibi davranmaz.
function getTransport(): Transporter {
  if (cachedTransport !== undefined) {
    if (!cachedTransport) throw new Error("SMTP is not configured (missing env vars).");
    return cachedTransport;
  }

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const port = Number(process.env.SMTP_PORT ?? 587);

  if (!host || !user || !pass) {
    cachedTransport = null;
    throw new Error("SMTP is not configured (missing env vars).");
  }

  cachedTransport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return cachedTransport;
}

export async function sendMail(payload: MailPayload): Promise<void> {
  const transport = getTransport();
  const from = process.env.SMTP_USER!;

  await transport.sendMail({
    from: `"Booky Kitabevi" <${from}>`,
    ...payload,
  });
}
