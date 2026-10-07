"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { pageInfo } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { useChatRealtime } from "@/features/chat/hooks/use-chat-realtime";
import { TitleWithSectionSwitcher } from "@/features/clubs/components/section-switcher";
import { NotificationBell } from "@/features/notifications/components/notification-bell";
import { TourLauncher } from "@/features/onboarding/components/tour-launcher";
import { AppSidebar } from "./app-sidebar";
import { BottomNav } from "./bottom-nav";
import { useNavigation } from "./use-navigation";

/** Renders nothing: keeps the chat cache (unread badge included) live while the user is in `/app`. */
function ChatRealtime() {
  useChatRealtime();
  return null;
}

/** Pages that manage their own full-height layout (no padding, no page scroll). */
const FULL_HEIGHT_PAGES = ["/app/chat"];

/**
 * Shell of the signed-in areas (`/app` and the admin `/dashboard`).
 * - Mobile: top bar (back button on detail pages, page title + section switcher, bell) and the
 *   bottom tab bar (`BottomNav`).
 * - Desktop (md+): the sidebar (same navigation config) and a slim header.
 */
export function AppShell({ variant, children }: { variant: "app" | "admin"; children: ReactNode }) {
  const pathname = usePathname();
  const { context } = useNavigation();
  const { title, back } = pageInfo(pathname, context);
  const isApp = variant === "app";
  const fullHeight = FULL_HEIGHT_PAGES.includes(pathname);

  return (
    <SidebarProvider>
      {isApp && <ChatRealtime />}
      <AppSidebar variant={variant} />
      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-30 border-b bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur supports-[backdrop-filter]:bg-background/80 md:border-b-0">
          <div className="flex h-(--app-topbar-height) items-center gap-1 px-2 md:h-14 md:px-4">
            {/* Desktop: sidebar toggle. Mobile: the admin area keeps its menu, the app has the bottom tabs. */}
            <SidebarTrigger className={cn(isApp && "max-md:hidden")} />
            {back ? (
              <Button variant="ghost" size="icon" asChild className="md:hidden">
                <Link href={back} aria-label="Retour">
                  <ChevronLeft className="size-6" />
                </Link>
              </Button>
            ) : (
              <span className="w-2 md:hidden" />
            )}
            <div className="flex min-w-0 flex-1 items-center md:invisible">
              {isApp ? <TitleWithSectionSwitcher title={title} /> : <span className="font-semibold">{title}</span>}
            </div>
            {isApp && <NotificationBell />}
            <ThemeToggle className="max-md:hidden" />
          </div>
        </header>
        <div
          className={cn(
            "flex-1",
            fullHeight
              ? "flex flex-col max-md:h-[calc(100dvh-var(--app-topbar-height)-var(--app-bottom-nav-height)-env(safe-area-inset-top)-env(safe-area-inset-bottom))] md:h-[calc(100dvh-3.5rem)] md:p-4 md:pt-0"
              : cn("px-4 pt-4 md:px-6 md:pt-2 md:pb-8", isApp ? "pb-[calc(var(--app-bottom-nav-height)+env(safe-area-inset-bottom)+1.5rem)]" : "pb-8"),
          )}
        >
          {children}
        </div>
      </SidebarInset>
      {isApp && <BottomNav />}
      {isApp && <TourLauncher />}
    </SidebarProvider>
  );
}
