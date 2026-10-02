import Image from "next/image";

export function SpotifyIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/images/icons/spotify-icon.svg"
      alt="Spotify"
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
}
