import Image from "next/image";

export function LinkedinIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/images/icons/linkedin-tile.svg"
      alt="LinkedIn"
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
}
