import type { Role } from "@prisma/client";

export const ROLE_LABELS: Record<Role, string> = {
  CUSTOMER: "Müşteri",
  SUPER_ADMIN: "Süper Yönetici",
  BLOG_MANAGER: "Blog Yöneticisi",
  BLOG_AUTHOR: "Blog Yazarı",
  PRODUCT_MANAGER: "Ürün Yöneticisi",
};
