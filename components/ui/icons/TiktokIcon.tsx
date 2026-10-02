import Image from "next/image";

export function TiktokIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/images/icons/tiktok-icon.svg"
      alt="TikTok"
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
}
