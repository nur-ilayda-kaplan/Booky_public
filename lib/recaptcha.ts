// Google reCAPTCHA v2 (checkbox) doğrulaması — sadece iletişim formunda spam
// botlarına karşı kullanılıyor (bkz. app/api/contact/route.ts). Site anahtarı
// (NEXT_PUBLIC_RECAPTCHA_SITE_KEY) tarayıcıda widget'ı render etmek için,
// gizli anahtar (RECAPTCHA_SECRET_KEY) ise burada token'ı Google'a doğrulatmak
// için kullanılır — ikisi de https://www.google.com/recaptcha/admin adresinden
// domain kaydedilerek alınır.
export async function verifyRecaptcha(token: string, remoteIp?: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    console.error("reCAPTCHA: RECAPTCHA_SECRET_KEY is not configured.");
    return false;
  }
  if (!token) return false;

  const params = new URLSearchParams({ secret, response: token });
  if (remoteIp) params.set("remoteip", remoteIp);

  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });
    const data = await response.json();
    return data?.success === true;
  } catch (error) {
    console.error("reCAPTCHA verification request failed", error);
    return false;
  }
}
