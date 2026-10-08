"use client";

import { useState } from "react";
import { Car, Clock, MapPin, Pencil, UserMinus, X } from "lucide-react";
import { useConfirm } from "@/components/app/confirm-dialog";
import { ErrorState } from "@/components/app/error-state";
import { LoadingState } from "@/components/app/loading-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDayLabel, formatTime } from "@/lib/format";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { cn } from "@/lib/utils";
import { InitialsAvatar } from "@/features/team/components/initials-avatar";
import { bookSeat, cancelRide, cancelSeat, removePassenger } from "../actions";
import { carpoolInvalidation, useEventCarpool } from "../hooks/use-event-carpool";
import type { CarpoolRide, EventCarpool } from "../types";
import { RideFormDialog } from "./ride-form-dialog";

const when = (date: string) => `${formatDayLabel(date).toLowerCase()} à ${formatTime(date)}`;

/** Event page block of an away match: the rides, "Réserver une place", "Je propose ma voiture". */
export function CarpoolCard({ eventId }: { eventId: string }) {
  const { data, isPending, error, refetch } = useEventCarpool(eventId);
  const [editing, setEditing] = useState<CarpoolRide | "new" | null>(null);

  if (isPending) return <LoadingState rows={1} />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (!data) return null;

  const isFree = !data.myRideId && !data.mySeatRideId;
  const mySeatRide = data.rides.find((ride) => ride.id === data.mySeatRideId);

  return (
    <section className="space-y-3 rounded-2xl border bg-card p-4" aria-labelledby="carpool-title">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="carpool-title" className="flex items-center gap-2 font-semibold">
            <Car className="size-5 text-info" aria-hidden /> Covoiturage
          </h2>
          <p className="text-sm text-muted-foreground">
            {data.rides.length === 0
              ? "Match à l'extérieur : organisez-vous pour y aller."
              : `${data.rides.length} voiture${data.rides.length > 1 ? "s" : ""} · ${data.seatsLeft} place${data.seatsLeft > 1 ? "s" : ""} libre${data.seatsLeft > 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {mySeatRide && (
        <p className="rounded-xl bg-success/10 px-3 py-2 text-sm text-success">
          Tu montes avec <span className="font-semibold">{mySeatRide.driver.name}</span>, départ {when(mySeatRide.departureTime)}.
        </p>
      )}

      {data.rides.length > 0 && (
        <ul className="space-y-2">
          {data.rides.map((ride) => (
            <RideItem key={ride.id} ride={ride} carpool={data} onEdit={() => setEditing(ride)} />
          ))}
        </ul>
      )}

      {!data.isOpen ? (
        <p className="text-sm text-muted-foreground">Le match a commencé : le covoiturage est fermé.</p>
      ) : (
        isFree && (
          <Button variant={data.seatsLeft > 0 ? "outline" : "default"} className="w-full md:w-auto" onClick={() => setEditing("new")}>
            <Car /> Je propose ma voiture
          </Button>
        )
      )}

      <RideFormDialog
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        eventId={eventId}
        ride={editing && editing !== "new" ? editing : undefined}
        defaultDeparture={data.defaultDeparture}
      />
    </section>
  );
}

function RideItem({ ride, carpool, onEdit }: { ride: CarpoolRide; carpool: EventCarpool; onEdit: () => void }) {
  const confirm = useConfirm();
  const options = { invalidate: carpoolInvalidation };
  const book = useActionMutation(bookSeat, options);
  const leave = useActionMutation(cancelSeat, options);
  const cancel = useActionMutation(cancelRide, options);
  const remove = useActionMutation(removePassenger, options);

  const isMine = carpool.myRideId === ride.id;
  const isMySeat = carpool.mySeatRideId === ride.id;
  const canBook = carpool.isOpen && !carpool.myRideId && !carpool.mySeatRideId && ride.seatsLeft > 0 && !ride.hasLeft;

  return (
    <li className={cn("space-y-2.5 rounded-xl border p-3", (isMine || isMySeat) && "border-primary/40 bg-primary/5")}>
      <div className="flex items-center gap-3">
        <InitialsAvatar name={ride.driver.name} src={ride.driver.image} className="size-10" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {ride.driver.name}
            {isMine && <span className="font-normal text-muted-foreground"> (toi)</span>}
          </p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3.5 shrink-0" aria-hidden /> Départ {when(ride.departureTime)}
          </p>
          <p className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" aria-hidden /> <span className="truncate">{ride.departurePlace}</span>
          </p>
        </div>
        <Badge variant={ride.seatsLeft > 0 ? "success" : "muted"} className="shrink-0">
          {ride.seatsLeft > 0 ? `${ride.seatsLeft} / ${ride.seats} libre${ride.seatsLeft > 1 ? "s" : ""}` : "Complet"}
        </Badge>
      </div>
      {ride.note && <p className="text-sm whitespace-pre-line text-muted-foreground">{ride.note}</p>}

      <div className="flex flex-wrap gap-1.5" aria-label="Passagers">
        {ride.passengers.map((passenger) => (
          <span key={passenger.id} className="flex items-center gap-1.5 rounded-full bg-muted py-1 pr-1 pl-1 text-xs">
            <InitialsAvatar name={passenger.name} src={passenger.image} className="size-6 text-[10px]" />
            <span className="pr-1">{passenger.name}</span>
            {isMine && carpool.isOpen && (
              <button
                type="button"
                className="flex size-7 items-center justify-center rounded-full outline-none hover:bg-background focus-visible:ring-[3px] focus-visible:ring-ring/50"
                aria-label={`Retirer ${passenger.name} de ta voiture`}
                disabled={remove.isPending}
                onClick={async () => {
                  const ok = await confirm({
                    title: `Retirer ${passenger.name} ?`,
                    description: "Il sera prévenu et pourra réserver une autre voiture.",
                    confirmLabel: "Retirer",
                  });
                  if (ok) remove.mutate(passenger.id);
                }}
              >
                <X className="size-3.5" aria-hidden />
              </button>
            )}
          </span>
        ))}
        {Array.from({ length: ride.seatsLeft }, (_, index) => (
          <span key={index} className="flex h-8 items-center rounded-full border border-dashed px-2.5 text-xs text-muted-foreground">
            Place libre
          </span>
        ))}
      </div>

      {(isMine || isMySeat || canBook) && carpool.isOpen && (
        <div className="flex flex-wrap gap-2">
          {canBook && (
            <Button size="sm" className="flex-1 md:flex-none" disabled={book.isPending} onClick={() => book.mutate(ride.id)}>
              Réserver une place
            </Button>
          )}
          {isMySeat && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 md:flex-none"
              disabled={leave.isPending}
              onClick={async () => {
                const ok = await confirm({
                  title: "Libérer ta place ?",
                  description: `${ride.driver.name} sera prévenu.`,
                  confirmLabel: "Libérer ma place",
                  cancelLabel: "Garder",
                });
                if (ok) leave.mutate(ride.id);
              }}
            >
              <UserMinus /> Libérer ma place
            </Button>
          )}
          {isMine && (
            <>
              <Button size="sm" variant="outline" className="flex-1 md:flex-none" onClick={onEdit}>
                <Pencil /> Modifier
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-destructive md:flex-none"
                disabled={cancel.isPending}
                onClick={async () => {
                  const ok = await confirm({
                    title: "Annuler ta voiture ?",
                    description:
                      ride.passengers.length > 0
                        ? `${ride.passengers.length} passager${ride.passengers.length > 1 ? "s seront prévenus" : " sera prévenu"}.`
                        : "Elle ne sera plus proposée.",
                    confirmLabel: "Annuler ma voiture",
                    cancelLabel: "Garder",
                  });
                  if (ok) cancel.mutate(ride.id);
                }}
              >
                <X /> Annuler
              </Button>
            </>
          )}
        </div>
      )}
    </li>
  );
}
