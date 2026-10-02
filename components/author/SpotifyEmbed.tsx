export function SpotifyEmbed({ url }: { url: string }) {
  return (
    <div className="overflow-hidden rounded-lg">
      <iframe
        src={url}
        title="Spotify playlist"
        width="100%"
        height="152"
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      />
    </div>
  );
}
