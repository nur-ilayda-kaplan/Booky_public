import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { Role } from "@prisma/client";

// Yönetim paneline girebilen tüm roller — Hesabım sayfası ve genel dosya
// yükleme endpoint'i gibi modül-bağımsız ekranlar için.
export const ADMIN_PANEL_ROLES: Role[] = [
  "SUPER_ADMIN",
  "BLOG_MANAGER",
  "BLOG_AUTHOR",
  "PRODUCT_MANAGER",
];

export function isAdminPanelRole(role: Role | undefined): boolean {
  return !!role && ADMIN_PANEL_ROLES.includes(role);
}

// ---- Panele girebilen her rol tüm modüllere erişir ----
// Modül bazlı ayrım (Blog/Ürün/sadece-SUPER_ADMIN), yayınlama yetkisi
// ve "sadece kendi yazısını düzenleyebilir"
// kuralı kasıtlı olarak kaldırıldı — panele girebilen herkes tam yetkili.

export async function requireSuperAdmin() {
  const session = await auth();
  const allowed = isAdminPanelRole(session?.user?.role);
  if (!allowed) {
    return { session: null as null, response: Response.json({ error: "FORBIDDEN" }, { status: 403 }) };
  }
  return { session, response: null as null };
}

export async function requireSuperAdminSession(callbackUrl: string) {
  const session = await auth();
  if (!session?.user) redirect(`/giris-yap?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  if (!isAdminPanelRole(session.user.role)) redirect("/");
  return session;
}

export async function requireCmsAccess() {
  const session = await auth();
  if (!isAdminPanelRole(session?.user?.role)) {
    return { session: null as null, response: Response.json({ error: "FORBIDDEN" }, { status: 403 }) };
  }
  return { session, response: null as null };
}

export async function requireCmsSession(callbackUrl: string) {
  const session = await auth();
  if (!session?.user) redirect(`/giris-yap?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  if (!isAdminPanelRole(session.user.role)) redirect("/");
  return session;
}

export async function requireBlogAccess() {
  const session = await auth();
  const allowed = isAdminPanelRole(session?.user?.role);
  if (!allowed) {
    return { session: null as null, response: Response.json({ error: "FORBIDDEN" }, { status: 403 }) };
  }
  return { session, response: null as null };
}

export async function requireBlogSession(callbackUrl: string) {
  const session = await auth();
  if (!session?.user) redirect(`/giris-yap?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  if (!isAdminPanelRole(session.user.role)) redirect("/");
  return session;
}

export function canPublishBlog(role: Role | undefined): boolean {
  return isAdminPanelRole(role);
}

export async function requireProductAccess() {
  const session = await auth();
  const allowed = isAdminPanelRole(session?.user?.role);
  if (!allowed) {
    return { session: null as null, response: Response.json({ error: "FORBIDDEN" }, { status: 403 }) };
  }
  return { session, response: null as null };
}

export async function requireProductSession(callbackUrl: string) {
  const session = await auth();
  if (!session?.user) redirect(`/giris-yap?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  if (!isAdminPanelRole(session.user.role)) redirect("/");
  return session;
}

export function canPublishProduct(role: Role | undefined): boolean {
  return isAdminPanelRole(role);
}

export function canEditBlogPost(_role: Role | undefined, _createdByUserId: string | null, _userId: string): boolean {
  return true;
}

export function shouldScopeBlogPostsToOwner(_role: Role | undefined): boolean {
  return false;
}
