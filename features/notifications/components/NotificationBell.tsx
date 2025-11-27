// components/NotificationBell.tsx
"use client";

import { BellIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNotifications } from "@/features/notifications";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { AvatarNotifications } from "./AvatarNotifications";

function Dot({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="currentColor"
      height="6"
      viewBox="0 0 6 6"
      width="6"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="3" cy="3" r="3" />
    </svg>
  );
}

export function NotificationBell({ userId }: { userId?: string } = {}) {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } =
    useNotifications(userId);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          aria-label="Open notifications"
          className="relative"
          size="icon"
          variant="outline"
        >
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
            <button
              className="font-medium text-xs hover:underline"
              onClick={() => markAllAsRead()}
              type="button"
            >
              Marquer tout comme lu
            </button>
          )}
        </div>
        <div
          aria-orientation="horizontal"
          className="-mx-1 my-1 h-px bg-border"
          role="separator"
          tabIndex={-1}
        />
        {isLoading ? (
          <div className="px-3 py-8 text-center text-sm text-muted-foreground">
            Chargement...
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-3 py-8 text-center text-sm text-muted-foreground">
            Aucune notification
          </div>
        ) : (
          notifications.map((notif) => {
            const fromName = (notif as any).fromUserName;
            const fromImage = (notif as any).fromUserImage;

            return (
              <div
                className="rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
                key={notif.id}
              >
                <div className="relative flex items-start gap-3 pe-3">
                  {fromName ? (
                    <AvatarNotifications name={fromName} image={fromImage} />
                  ) : (
                    <div className="size-9 rounded-md bg-gray-500 flex items-center justify-center text-white font-bold text-base">
                      ?
                    </div>
                  )}

                  <div className="flex-1 space-y-1 min-w-0">
                    <button
                      className="text-left text-foreground/80 after:absolute after:inset-0"
                      onClick={() => markAsRead(notif.id)}
                      type="button"
                    >
                      <span className="font-medium text-foreground hover:underline">
                        {notif.title}
                      </span>
                      {" - "}
                      {notif.message}
                    </button>
                    <div className="text-muted-foreground text-xs">
                      {formatDistanceToNow(new Date(notif.createdAt), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </div>
                  </div>
                  {!notif.read && (
                    <div className="absolute end-0 self-center">
                      <Dot />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        {notifications.length === 10 && (
          <>
            <div
              aria-orientation="horizontal"
              className="-mx-1 my-1 h-px bg-border"
              role="separator"
              tabIndex={-1}
            />
            <div className="px-3 py-2 text-center text-muted-foreground text-xs">
              Affichage des 10 dernières notifications
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
