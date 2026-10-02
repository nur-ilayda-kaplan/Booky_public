import type { ElementType, ReactNode } from "react";

// Header'ın sol/sağ kenar boşlukları simetrik (bkz.
// components/layout/Header.tsx kapsayıcısının pl-*/pr-* değerleri, ve
// logonun bu değerlerle birebir aynı left ofseti) — sayfa içeriği de aynı
// pl-*/pr-* değerlerini kullanarak Header'la hem sol hem sağ kenardan
// birebir hizalanıyor.
const CONTAINER_CLASSES =
  "mx-auto max-w-7xl pl-4 pr-4 sm:pl-8 sm:pr-8 lg:pl-16 lg:pr-16";

export function PageContainer({
  as: Component = "div",
  className = "",
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={CONTAINER_CLASSES}>
      <Component className={`min-w-0 ${className}`.trim()}>
        {children}
      </Component>
    </div>
  );
}
