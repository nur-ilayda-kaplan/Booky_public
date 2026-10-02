export interface NavLink {
  href: string;
  label: string;
  external?: boolean;
  newTab?: boolean;
  showOnMobile?: boolean;
}

export interface NavGroup {
  label: string;
  children: NavLink[];
  showOnMobile?: boolean;
}

export type NavEntry = NavLink | NavGroup;

export function isNavGroup(entry: NavEntry): entry is NavGroup {
  return "children" in entry;
}
