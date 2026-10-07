"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fan, House, LayoutDashboard } from "lucide-react";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { MORE_NAV, PRIMARY_NAV, isActive, visibleItems, type NavItem } from "@/lib/navigation";
import { SectionSwitcher } from "@/features/clubs/components/section-switcher";
import { NavUser } from "./nav-user";
import { badgeLabel, badgeText, useNavigation } from "./use-navigation";

const ADMIN_NAV: NavItem[] = [
  { title: "Utilisateurs", href: "/dashboard", icon: LayoutDashboard },
  { title: "Retour à l'application", href: "/app", icon: House },
];

/** Desktop navigation (md+), built from the same config as the bottom tabs (`lib/navigation.ts`). */
export function AppSidebar({ variant }: { variant: "app" | "admin" }) {
  const { context, counts } = useNavigation();
  const isApp = variant === "app";
  const groups = isApp
    ? [
        { label: "Mon club", items: visibleItems(PRIMARY_NAV, context) },
        { label: "Plus", items: visibleItems(MORE_NAV, context) },
      ]
    : [{ label: "Administration", items: ADMIN_NAV }];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        {isApp ? (
          <SectionSwitcher />
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href="/">
                  <Fan className="size-4" />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">FootHubGo</span>
                    <span className="truncate text-xs text-muted-foreground">Administration</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarHeader>
      <SidebarContent>
        {groups.map((group) =>
          group.items.length === 0 ? null : (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarLink key={item.href} item={item} count={item.badge ? counts[item.badge] : 0} />
                ))}
              </SidebarMenu>
            </SidebarGroup>
          ),
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function SidebarLink({ item, count }: { item: NavItem; count: number }) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild tooltip={item.title} isActive={isActive(item, pathname)}>
        {/* The mobile sheet (admin area) closes once a page is chosen. */}
        <Link href={item.href} onClick={() => setOpenMobile(false)} data-tour={item.tour}>
          <item.icon />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
      {count > 0 && item.badge && (
        <SidebarMenuBadge aria-label={badgeLabel(item.badge, count)}>{badgeText(count)}</SidebarMenuBadge>
      )}
    </SidebarMenuItem>
  );
}
