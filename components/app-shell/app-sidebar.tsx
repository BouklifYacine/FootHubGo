"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  Calendar,
  CalendarCheck,
  CalendarDays,
  ChartNoAxesCombined,
  Fan,
  Hospital,
  House,
  LayoutDashboard,
  MessageCircle,
  UsersRound,
  Vote,
  type LucideIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import type { TeamRole } from "@/generated/prisma/browser";
import { useUnreadMessagesCount } from "@/features/chat/hooks/use-conversations";
import { useMyTeam } from "@/features/team/hooks/use-my-team";
import { NavUser } from "./nav-user";

type NavItem = { title: string; url: string; icon: LucideIcon; roles?: TeamRole[] };

const appItems: NavItem[] = [
  { title: "Accueil", url: "/app", icon: House },
  { title: "Transfert", url: "/app/transfers", icon: ArrowLeftRight, roles: ["NO_CLUB", "COACH"] },
  { title: "Effectif", url: "/app/squad", icon: UsersRound, roles: ["COACH", "PLAYER"] },
  { title: "Événements", url: "/app/events", icon: Calendar, roles: ["COACH", "PLAYER"] },
  { title: "Statistiques", url: "/app/stats", icon: ChartNoAxesCombined, roles: ["COACH", "PLAYER"] },
  { title: "Convocations", url: "/app/call-ups", icon: CalendarCheck, roles: ["PLAYER"] },
  { title: "Blessures", url: "/app/injuries", icon: Hospital, roles: ["COACH", "PLAYER"] },
  { title: "Calendrier", url: "/app/calendar", icon: CalendarDays, roles: ["COACH", "PLAYER"] },
  { title: "Sondages", url: "/app/polls", icon: Vote, roles: ["COACH", "PLAYER"] },
  { title: "Messages", url: "/app/chat", icon: MessageCircle, roles: ["COACH", "PLAYER"] },
];

const adminItems: NavItem[] = [
  { title: "Utilisateurs", url: "/dashboard", icon: LayoutDashboard },
  { title: "Retour à l'application", url: "/app", icon: House },
];

export function AppSidebar({ variant }: { variant: "app" | "admin" }) {
  const pathname = usePathname();
  const { data } = useMyTeam();
  const role = data?.role ?? "NO_CLUB";
  const unreadMessages = useUnreadMessagesCount(variant === "app" && role !== "NO_CLUB");

  const items =
    variant === "admin" ? adminItems : appItems.filter((item) => !item.roles || item.roles.includes(role));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <Fan className="size-4" />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">FootHubGo</span>
                  <span className="truncate text-xs">
                    {variant === "admin" ? "Administration" : (data?.team?.name ?? "Sans club")}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{variant === "admin" ? "Administration" : "Mon club"}</SidebarGroupLabel>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton asChild tooltip={item.title} isActive={pathname === item.url}>
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
                {item.url === "/app/chat" && unreadMessages > 0 && (
                  <SidebarMenuBadge aria-label={`${unreadMessages} messages non lus`}>
                    {unreadMessages > 99 ? "99+" : unreadMessages}
                  </SidebarMenuBadge>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
