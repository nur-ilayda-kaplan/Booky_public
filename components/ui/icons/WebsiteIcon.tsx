import Image from "next/image";

export function WebsiteIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/images/icons/globe.svg"
      alt="Website"
      width={size}
      height={size}
      className={className}
    />
  );
}
