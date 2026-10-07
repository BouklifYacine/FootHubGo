"use client";

import { BellIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "../hooks/use-notifications";
import { NotificationAvatar } from "./notification-avatar";

function Separator() {
  return <div aria-orientation="horizontal" className="-mx-1 my-1 h-px bg-border" role="separator" />;
}

export function NotificationBell() {
  const { data, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button aria-label="Ouvrir les notifications" className="relative" size="icon" variant="outline">
          <BellIcon aria-hidden="true" size={16} />
          {unreadCount > 0 && (
            <Badge className="-top-2 -translate-x-1/2 absolute left-full min-w-5 h-5 flex items-center justify-center px-1.5">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-1">
        <div className="flex items-baseline justify-between gap-4 px-3 py-2">
          <div className="font-semibold text-sm">Notifications</div>
          {unreadCount > 0 && (
            <button className="font-medium text-xs hover:underline" onClick={() => markAllRead.mutate()} type="button">
              Marquer tout comme lu
            </button>
          )}
        </div>
        <Separator />

        {isLoading ? (
          <div className="px-3 py-8 text-center text-sm text-muted-foreground">Chargement...</div>
        ) : notifications.length === 0 ? (
          <div className="px-3 py-8 text-center text-sm text-muted-foreground">Aucune notification</div>
        ) : (
          notifications.map((notification) => (
            <div className="rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent" key={notification.id}>
              <div className="relative flex items-start gap-3 pe-3">
                <NotificationAvatar name={notification.fromUserName} image={notification.fromUserImage} />
                <div className="flex-1 space-y-1 min-w-0">
                  <button
                    className="text-left text-foreground/80 after:absolute after:inset-0"
                    onClick={() => !notification.read && markRead.mutate(notification.id)}
                    type="button"
                  >
                    <span className="font-medium text-foreground hover:underline">{notification.title}</span>
                    {" - "}
                    {notification.message}
                  </button>
                  <div className="text-muted-foreground text-xs">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: fr })}
                  </div>
                </div>
                {!notification.read && (
                  <span className="absolute end-0 self-center size-1.5 rounded-full bg-current" aria-label="Non lue" />
                )}
              </div>
            </div>
          ))
        )}

        {notifications.length === 10 && (
          <>
            <Separator />
            <div className="px-3 py-2 text-center text-muted-foreground text-xs">
              Affichage des 10 dernières notifications
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
