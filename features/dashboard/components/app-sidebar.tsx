"use client";

import * as React from "react";
import {
  Calendar,
  House,
  UsersRound,
  ChartNoAxesCombined,
  CalendarPlus2,
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

interface Props {
  props?: React.ComponentProps<typeof Sidebar>;
}

const navigationData = {
  teams: [],
  navMain: [
    { title: "Accueil", url: "/dashboardfoothub", icon: House, isActive: true },
    { title: "Effectif", url: "/dashboardfoothub/effectif", icon: UsersRound },
    { title: "Evenements", url: "/dashboardfoothub/evenements", icon: Calendar },
    { title: "Statistiques", url: "/dashboardfoothub/statistiques", icon: ChartNoAxesCombined },
    { title: "Convocations", url: "/dashboardfoothub/convocations", icon: CalendarPlus2 },
  ],
};

export function AppSidebar({ props }: Props) {
  const { data: clubData, isPending } = useInfosClub();

  const role = clubData?.role;

  const nav = React.useMemo(() => {
    if (!role) {
      return navigationData.navMain.filter(item => item.title === "Accueil");
    }

    if (role === "SANSCLUB") {
      return navigationData.navMain.filter(item => item.title === "Accueil");
    }

    if (role === "ENTRAINEUR") {
      return navigationData.navMain.filter(item => item.title !== "Convocations");
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
