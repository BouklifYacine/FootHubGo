import {
  CalendarDays,
  ChartNoAxesCombined,
  Ellipsis,
  Hospital,
  House,
  MessageCircle,
  Search,
  Settings,
  Shield,
  UserPlus,
  UsersRound,
  Vote,
  type LucideIcon,
} from "lucide-react";

/**
 * The ONE navigation config of the app: bottom tabs (mobile), sidebar (desktop), the "Plus" page
 * and the top bar titles all come from here.
 */

export type NavContext = {
  hasClub: boolean;
  /** Coach of the active section, or club OWNER / ADMIN. */
  canManage: boolean;
  /** Club OWNER / ADMIN. */
  isClubAdmin: boolean;
};

export type NavBadge = "messages" | "callUps" | "joinRequests";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  /** `data-tour` anchor of the onboarding tour. */
  tour?: string;
  badge?: NavBadge;
  /** Other routes that belong to this item (active state). */
  matches?: string[];
  visible?: (context: NavContext) => boolean;
};

const hasClub = (context: NavContext) => context.hasClub;

/** Bottom tabs on mobile, main group of the sidebar on desktop. */
export const PRIMARY_NAV: NavItem[] = [
  { title: "Accueil", href: "/app", icon: House, tour: "nav-home" },
  {
    title: "Agenda",
    href: "/app/events",
    icon: CalendarDays,
    tour: "nav-agenda",
    badge: "callUps",
    visible: hasClub,
  },
  {
    title: "Équipe",
    href: "/app/squad",
    icon: UsersRound,
    tour: "nav-team",
    badge: "joinRequests",
    visible: hasClub,
  },
  {
    title: "Clubs",
    href: "/app/join-requests",
    icon: Search,
    visible: (context) => !context.hasClub,
  },
  { title: "Messages", href: "/app/chat", icon: MessageCircle, tour: "nav-messages", badge: "messages", visible: hasClub },
];

/** The "Plus" tab (mobile) and the second group of the sidebar (desktop). */
export const MORE_NAV: NavItem[] = [
  { title: "Statistiques", href: "/app/stats", icon: ChartNoAxesCombined, visible: hasClub },
  { title: "Blessures", href: "/app/injuries", icon: Hospital, visible: hasClub },
  { title: "Sondages", href: "/app/polls", icon: Vote, visible: hasClub },
  {
    title: "Demandes d'adhésion",
    href: "/app/join-requests",
    icon: UserPlus,
    badge: "joinRequests",
    visible: (context) => context.hasClub && context.canManage,
  },
  { title: "Gérer le club", href: "/app/club", icon: Shield, visible: (context) => context.isClubAdmin },
  { title: "Paramètres", href: "/app/settings", icon: Settings },
];

export const MORE_TAB: NavItem = {
  title: "Plus",
  href: "/app/more",
  icon: Ellipsis,
  tour: "nav-more",
  matches: MORE_NAV.map((item) => item.href),
};

export const visibleItems = (items: NavItem[], context: NavContext) =>
  items.filter((item) => !item.visible || item.visible(context));

/** Is `item` the current page (or the tab the current page belongs to)? */
export function isActive(item: NavItem, pathname: string) {
  const hrefs = [item.href, ...(item.matches ?? [])];
  return hrefs.some((href) => (href === "/app" ? pathname === "/app" : pathname === href || pathname.startsWith(`${href}/`)));
}

/**
 * Title shown in the mobile top bar + where its back button goes (detail pages and the pages
 * opened from "Plus").
 */
export function pageInfo(pathname: string, context: Pick<NavContext, "hasClub">): { title: string; back?: string } {
  if (pathname.startsWith("/app/events/")) return { title: "Événement", back: "/app/events" };
  if (pathname === "/app/join-requests" && !context.hasClub) return { title: "Trouver un club" };
  const primary = PRIMARY_NAV.find((item) => item.href === pathname);
  if (primary) return { title: primary.title };
  const more = MORE_NAV.find((item) => item.href === pathname);
  if (more) return { title: more.title, back: "/app/more" };
  if (pathname === MORE_TAB.href) return { title: "Plus" };
  if (pathname.startsWith("/dashboard")) return { title: "Administration" };
  return { title: "FootHubGo" };
}
