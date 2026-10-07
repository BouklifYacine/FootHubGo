"use client";

import { differenceInHours, format } from "date-fns";
import { fr } from "date-fns/locale";
import { Ban, Calendar, CircleCheck, CircleX, Clock, MapPin, UsersRound } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EVENT_TYPES } from "@/features/events/event-types";
import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { cn } from "@/lib/utils";
import stadium from "@/public/action-de-footballeur-sur-le-stade.jpg";
import { replyToCallUp } from "../actions";
import type { MyCallUp } from "../types";

function InfoRow({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex size-9 items-center justify-center rounded-full bg-blue-500 text-white [&_svg]:size-5">
        {icon}
      </div>
      <p>{children}</p>
    </div>
  );
}

export function MyCallUpCard({ callUp }: { callUp: MyCallUp }) {
  const reply = useActionMutation(replyToCallUp, {
    invalidate: [queryKeys.me.callUps, queryKeys.events.callUps(callUp.event.id)],
  });
  const { event } = callUp;
  const hoursLeft = differenceInHours(event.startDate, new Date());
  const isExpired = callUp.isExpired || callUp.status === "EXPIRED";
  const isPending = callUp.status === "PENDING" && !isExpired;
  const isAnswered = callUp.status === "CONFIRMED" || callUp.status === "DECLINED";

  return (
    <div className="w-full max-w-[425px] overflow-hidden rounded-xl border bg-card shadow-sm">
      <div
        className="space-y-6 bg-cover bg-center p-3"
        style={{ backgroundImage: `url(${stadium.src})` }}
      >
        <div className="flex items-start justify-between">
          <Badge className={EVENT_TYPES[event.type].badgeClass}>{EVENT_TYPES[event.type].label}</Badge>
          {callUp.status === "CONFIRMED" && <Badge className="bg-green-100 text-green-700">Confirmé</Badge>}
          {callUp.status === "DECLINED" && <Badge className="bg-red-100 text-red-700">Refusé</Badge>}
          {isExpired && <Badge className="bg-gray-100 text-gray-700">Expiré</Badge>}
        </div>
        <p className="text-2xl font-bold tracking-tighter text-white">{event.title}</p>
      </div>

      {isPending && hoursLeft < 24 && (
        <div className="mx-4 mt-4 rounded border-l-4 border-orange-500 bg-orange-100 p-2 text-sm text-orange-700">
          Réponse urgente : le match est dans moins de 24h
        </div>
      )}

      <div className="flex flex-col gap-4 p-4">
        <InfoRow icon={<Calendar />}>{format(event.startDate, "EEEE d MMMM", { locale: fr })}</InfoRow>
        {event.opponent && <InfoRow icon={<UsersRound />}>{event.opponent}</InfoRow>}
        <InfoRow icon={<Clock />}>{format(event.startDate, "HH:mm")}</InfoRow>
        {event.location && <InfoRow icon={<MapPin />}>{event.location}</InfoRow>}
      </div>

      <div className="flex flex-col items-center gap-2 p-4 pt-0">
        {isPending && (
          <div className="grid w-full grid-cols-2 gap-2">
            <Button
              className="bg-red-500 font-bold text-white hover:bg-red-600"
              disabled={reply.isPending}
              onClick={() => reply.mutate({ callUpId: callUp.id, status: "DECLINED" })}
            >
              <CircleX /> Refuser
            </Button>
            <Button
              className="bg-green-500 font-bold text-white hover:bg-green-600"
              disabled={reply.isPending}
              onClick={() => reply.mutate({ callUpId: callUp.id, status: "CONFIRMED" })}
            >
              <CircleCheck /> Accepter
            </Button>
          </div>
        )}
        {isExpired && (
          <Button disabled className="w-full bg-gray-400 font-bold text-white">
            <Ban /> Délai de réponse expiré (3h avant le match)
          </Button>
        )}
        {isAnswered && (
          <>
            <Button
              disabled
              className={cn(
                "w-full font-bold text-white",
                callUp.status === "CONFIRMED" ? "bg-green-500" : "bg-red-500",
              )}
            >
              {callUp.status === "CONFIRMED" ? <CircleCheck /> : <CircleX />}
              {callUp.status === "CONFIRMED" ? "Présence confirmée" : "Absence confirmée"}
            </Button>
            {callUp.respondedAt && (
              <p className="text-xs text-muted-foreground">
                Répondu le {format(callUp.respondedAt, "dd/MM 'à' HH:mm")}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
