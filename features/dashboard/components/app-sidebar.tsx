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
import { RoleEquipe } from "@prisma/client";

interface Props {
  props?: RoleEquipe;
}

const navigationData = {
  teams: [],
  navMain: [
    { title: "Accueil", url: "/dashboardfoothub", icon: House, isActive: true },
    { title: "Transfert", url: "/dashboardfoothub/transfert", icon: House },
    { title: "Effectif", url: "/dashboardfoothub/effectif", icon: UsersRound },
    {
      title: "Evenements",
      url: "/dashboardfoothub/evenements",
      icon: Calendar,
    },
    {
      title: "Statistiques",
      url: "/dashboardfoothub/statistiques",
      icon: ChartNoAxesCombined,
    },
    {
      title: "Convocations",
      url: "/dashboardfoothub/convocations",
      icon: CalendarPlus2,
    },
    { title: "Blessures", url: "/dashboardfoothub/blessures", icon: Hospital },
    {
      title: "Calendrier",
      url: "/dashboardfoothub/calendrier",
      icon: CalendarPlus2,
    },
    { title: "Messages", url: "/dashboardfoothub/chat", icon: MessageCircle },
  ],
};

export function AppSidebar({ props }: Props) {
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
