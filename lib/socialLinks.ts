import { InstagramIcon } from "@/components/ui/icons/InstagramIcon";
import { WhatsappIcon } from "@/components/ui/icons/WhatsappIcon";
import { FacebookIcon } from "@/components/ui/icons/FacebookIcon";
import { TwitterIcon } from "@/components/ui/icons/TwitterIcon";
import { YoutubeIcon } from "@/components/ui/icons/YoutubeIcon";
import { LinkedinIcon } from "@/components/ui/icons/LinkedinIcon";
import { TiktokIcon } from "@/components/ui/icons/TiktokIcon";
import { SpotifyIcon } from "@/components/ui/icons/SpotifyIcon";
import { SubstackIcon } from "@/components/ui/icons/SubstackIcon";
import { buildWhatsappLink } from "@/lib/whatsapp";
import type { ResolvedSiteSettings } from "@/lib/services/siteSettings";

export interface SocialLink {
  href: string;
  label: string;
  icon: typeof InstagramIcon;
}

export function getSocialLinks(settings: ResolvedSiteSettings): SocialLink[] {
  return [
    { href: settings.socialInstagram, label: "Instagram", icon: InstagramIcon },
    {
      href: settings.whatsapp ? buildWhatsappLink(settings.whatsapp) : null,
      label: "WhatsApp",
      icon: WhatsappIcon,
    },
    { href: settings.socialFacebook, label: "Facebook", icon: FacebookIcon },
    { href: settings.socialX, label: "X", icon: TwitterIcon },
    { href: settings.socialYoutube, label: "YouTube", icon: YoutubeIcon },
    { href: settings.socialLinkedin, label: "LinkedIn", icon: LinkedinIcon },
    { href: settings.socialTiktok, label: "TikTok", icon: TiktokIcon },
    { href: settings.socialSpotify, label: "Spotify", icon: SpotifyIcon },
    { href: settings.socialSubstack, label: "Substack", icon: SubstackIcon },
  ].filter((entry): entry is SocialLink => Boolean(entry.href));
}
