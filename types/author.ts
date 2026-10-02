export interface Author {
  id: string;
  slug: string;
  name: string;
  photo: string;
  shortBio: string;
  bio: string;
  socials: {
    instagram?: string;
    twitter?: string;
    website?: string;
  };
  spotifyPlaylistUrl?: string;
}
