"use client";

import Link from "next/link";
import { useState } from "react";
import { BellIcon, BellOff } from "lucide-react";
import { LoadingState } from "@/components/app/loading-state";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { NotificationDto } from "@/lib/realtime/protocol";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useNotificationsQuery,
} from "../hooks/use-notifications";
import { NotificationAvatar } from "./notification-avatar";

/**
 * The bell: a popover on desktop, a full-height sheet on phones. Each notification opens its page
 * (call-up -> the event, where the player answers) and is marked read.
 */
export function NotificationBell() {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const { data } = useNotifications();
  const unreadCount = data?.unreadCount ?? 0;

  const trigger = (
    <Button
      aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} non lue${unreadCount > 1 ? "s" : ""}` : "Notifications"}
      className="relative"
      size="icon"
      variant="ghost"
      data-tour="notification-bell"
      onClick={isMobile ? () => setOpen(true) : undefined}
    >
      <BellIcon aria-hidden className="size-5" />
      {unreadCount > 0 && (
        <span
          aria-hidden
          className="absolute top-1 right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white ring-2 ring-background md:top-0 md:right-0"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Button>
  );

  if (isMobile) {
    return (
      <>
        {trigger}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="right" className="w-full gap-0 p-0 pt-[env(safe-area-inset-top)] sm:max-w-sm">
            <SheetHeader className="border-b pr-14">
              <SheetTitle>Notifications</SheetTitle>
              <SheetDescription className="sr-only">Tes dernières notifications</SheetDescription>
            </SheetHeader>
            <NotificationList onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="border-b px-4 py-3 text-sm font-semibold">Notifications</div>
        <NotificationList onNavigate={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}

function NotificationList({ onNavigate }: { onNavigate: () => void }) {
  const { data, isLoading } = useNotificationsQuery();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  if (isLoading) return <LoadingState rows={3} className="p-3" />;
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-4 py-10 text-center text-sm text-muted-foreground">
        <BellOff className="size-6" aria-hidden />
        Aucune notification pour le moment.
      </div>
    );
  }

  const open = (notification: NotificationDto) => {
    if (!notification.read) markRead.mutate(notification.id);
    onNavigate();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {unreadCount > 0 && (
        <div className="flex justify-end border-b px-2 py-1">
          <Button variant="ghost" size="sm" onClick={() => markAllRead.mutate()}>
            Tout marquer comme lu
          </Button>
        </div>
      )}
      <ul className="max-h-[70vh] flex-1 divide-y overflow-y-auto md:max-h-[60vh]">
        {notifications.map((notification) => {
          const content = (
            <>
              <NotificationAvatar name={notification.fromUserName} image={notification.fromUserImage} />
              <span className="min-w-0 flex-1 space-y-0.5">
                <span className={cn("block text-sm", !notification.read && "font-semibold")}>{notification.title}</span>
                <span className="block text-sm text-muted-foreground">{notification.message}</span>
                <span className="block text-xs text-muted-foreground">{formatRelative(notification.createdAt)}</span>
              </span>
              {!notification.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-info" aria-label="Non lue" />}
            </>
          );
          const className = "flex w-full items-start gap-3 px-4 py-3 text-left outline-none hover:bg-accent/60 focus-visible:bg-accent";
          return (
            <li key={notification.id}>
              {notification.url ? (
                <Link href={notification.url} className={className} onClick={() => open(notification)}>
                  {content}
                </Link>
              ) : (
                <button type="button" className={className} onClick={() => !notification.read && markRead.mutate(notification.id)}>
                  {content}
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {notifications.length === 10 && (
        <p className="border-t px-4 py-2 text-center text-xs text-muted-foreground">Les 10 dernières notifications</p>
      )}
    </div>
  );
}
