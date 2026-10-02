import Image from "next/image";

export function WhatsappIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/images/icons/WhatsApp-Logo.wine.svg"
      alt="WhatsApp"
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size }}
    />
  );
}
