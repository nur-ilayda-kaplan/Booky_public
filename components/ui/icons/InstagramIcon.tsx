import Image from "next/image";

export function InstagramIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/images/icons/Instagram-Logo.wine.svg"
      alt="Instagram"
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size }}
    />
  );
}
