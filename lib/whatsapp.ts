export function buildWhatsappLink(phone: string, message?: string): string {
  const digits = phone.replace(/[^0-9]/g, "");
  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${query}`;
}
