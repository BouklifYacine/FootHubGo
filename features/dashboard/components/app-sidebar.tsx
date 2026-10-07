"use client";

import * as React from "react";
import {
  Calendar,
  House,
  UsersRound,
  ChartNoAxesCombined,
  CalendarPlus2,
  Hospital,
  MessageCircle,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { TeamSwitcher } from "./team-switcher";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { useInfosClub } from "@/features/club/hooks/useinfosclub";

type Props = React.ComponentProps<typeof Sidebar>;

const navigationData = {
  teams: [],
  navMain: [
    { title: "Accueil", url: "/app", icon: House, isActive: true },
    { title: "Transfert", url: "/app/transfers", icon: House },
    { title: "Effectif", url: "/app/squad", icon: UsersRound },
    {
      title: "Evenements",
      url: "/app/events",
      icon: Calendar,
    },
    {
      title: "Statistiques",
      url: "/app/stats",
      icon: ChartNoAxesCombined,
    },
    {
      title: "Convocations",
      url: "/app/call-ups",
      icon: CalendarPlus2,
    },
    { title: "Blessures", url: "/app/injuries", icon: Hospital },
    {
      title: "Calendrier",
      url: "/app/calendar",
      icon: CalendarPlus2,
    },
    { title: "Messages", url: "/app/chat", icon: MessageCircle },
  ],
};

export function AppSidebar(props: Props) {
  const { data: clubData, isPending } = useInfosClub();

  const role = clubData?.role;

  const nav = React.useMemo(() => {
    // No club: only show Accueil and Transfert
    if (!role || role === "SANSCLUB") {
      return navigationData.navMain.filter((item) =>
        ["Accueil", "Transfert"].includes(item.title)
      );
    }

    // Coach: show all except Convocations
    if (role === "ENTRAINEUR") {
      return navigationData.navMain.filter(
        (item) => item.title !== "Convocations"
      );
    }

    // Player with club: hide Transfert and Convocations stays visible
    if (role === "JOUEUR") {
      return navigationData.navMain.filter(
        (item) => item.title !== "Transfert"
      );
    }

    return navigationData.navMain;
  }, [role]);

  if (isPending) {
    return (
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <div className="p-4">Chargement...</div>
        </SidebarHeader>
      </Sidebar>
    );
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={navigationData.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={nav} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
