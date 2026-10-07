"use client";

import { formatDate } from "@/lib/format";
import { useState } from "react";
import { Activity, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConfirm } from "@/components/app/confirm-dialog";
import { EmptyState } from "@/components/app/empty-state";
import { ErrorState } from "@/components/app/error-state";
import { LoadingState } from "@/components/app/loading-state";
import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/ui/timeline";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { deleteInjury } from "../actions";
import { injuryInvalidation, usePlayerInjuries } from "../hooks/use-injuries";
import type { PlayerInjury } from "../types";
import { InjuryFormDialog } from "./injury-form-dialog";


/** The player's own injury history, as a timeline. */
export function PlayerInjuries({ userId }: { userId: string }) {
  const { data: injuries, isLoading, error, refetch } = usePlayerInjuries(userId);

  if (isLoading) return <LoadingState rows={2} />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  if (!injuries?.length) {
    return (
      <EmptyState
        icon={Activity}
        title="Aucune blessure"
        description="Ton historique de blessures apparaîtra ici. Déclare une blessure pour prévenir ton coach."
      />
    );
  }

  return (
    <Timeline defaultValue={injuries.length}>
      {injuries.map((injury, index) => (
        <TimelineItem
          key={injury.id}
          step={index + 1}
          className="sm:group-data-[orientation=vertical]/timeline:ms-32"
        >
          <TimelineHeader>
            <TimelineSeparator />
            <TimelineDate className="sm:group-data-[orientation=vertical]/timeline:absolute sm:group-data-[orientation=vertical]/timeline:-left-32 sm:group-data-[orientation=vertical]/timeline:w-20 sm:group-data-[orientation=vertical]/timeline:text-right">
              {formatDate(injury.startDate)}
            </TimelineDate>
            <div className="flex items-center justify-between w-full">
              <TimelineTitle className="sm:-mt-0.5 text-base">Type de blessure : {injury.type}</TimelineTitle>
              <InjuryActionsMenu injury={injury} />
            </div>
            <TimelineIndicator />
          </TimelineHeader>
          <TimelineContent>
            <div className="text-sm font-medium mb-1">Retour : {formatDate(injury.endDate)}</div>
            {injury.description && <div className="text-muted-foreground">{injury.description}</div>}
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}

function InjuryActionsMenu({ injury }: { injury: PlayerInjury }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const confirm = useConfirm();
  const remove = useActionMutation(deleteInjury, { invalidate: injuryInvalidation });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
            aria-label="Actions"
          >
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            <Pencil />
            Modifier
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={async () => {
              const ok = await confirm({
                title: "Supprimer cette blessure ?",
                description: "Elle disparaîtra définitivement de ton historique.",
                confirmLabel: "Supprimer",
              });
              if (ok) remove.mutate(injury.id);
            }}
          >
            <Trash2 />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <InjuryFormDialog injury={injury} open={isEditOpen} onOpenChange={setIsEditOpen} />

    </>
  );
}
