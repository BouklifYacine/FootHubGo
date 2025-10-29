"use client";

import * as React from "react";
import {
  Calendar,
  House ,
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

export type Role = "ENTRAINEUR" | "JOUEUR" | "SANSCLUB"; 
interface Props {
  props?: React.ComponentProps<typeof Sidebar>;
  role: Role;
}

const data = {
  teams: [],
  navMain: [
    { title: "Accueil", url: "/dashboardfoothub", icon: House, isActive: true },
    { title: "Effectif", url: "/dashboardfoothub/effectif", icon: UsersRound },
    { title: "Evenements", url: "/dashboardfoothub/evenements", icon: Calendar },
    { title: "Statistiques", url: "/dashboardfoothub/statistiques", icon: ChartNoAxesCombined },
    { title: "Convocations", url: "/dashboardfoothub/convocations", icon: CalendarPlus2 },
  ],
};

export function AppSidebar({ props, role }: Props) {
  const nav = React.useMemo(() => data.navMain.filter(item => item.title !== "Convocations" || role === "JOUEUR"),[role]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
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