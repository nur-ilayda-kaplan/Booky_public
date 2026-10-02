import Image from "next/image";

export function YoutubeIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/images/icons/youtube-icon.svg"
      alt="YouTube"
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
}
