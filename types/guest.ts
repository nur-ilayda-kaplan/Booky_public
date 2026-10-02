export interface Guest {
  id: string;
  slug: string;
  name: string;
  photo: string;
  shortBio: string;
  bio: string;
  visitDate?: string;
  socials?: {
    instagram?: string;
    twitter?: string;
    website?: string;
  };
}
