"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Activity, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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

const formatDate = (date: string) => format(date, "dd MMM yyyy", { locale: fr });

/** The player's own injury history, as a timeline. */
export function PlayerInjuries({ userId }: { userId: string }) {
  const { data: injuries, isLoading, error } = usePlayerInjuries(userId);

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <p className="text-red-500">{error.message}</p>;

  if (!injuries?.length) {
    return (
      <div className="rounded-xl border border-dashed dark:border-zinc-800 p-12 text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4">
          <Activity className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Aucune blessure</h3>
        <p className="text-muted-foreground">L&apos;historique de vos blessures apparaîtra ici.</p>
      </div>
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
            {injury.description && <div className="opacity-45">{injury.description}</div>}
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}

function InjuryActionsMenu({ injury }: { injury: PlayerInjury }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const remove = useActionMutation(deleteInjury, { invalidate: injuryInvalidation });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
            aria-label="Actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Modifier
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setIsDeleteOpen(true)}
            className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <InjuryFormDialog injury={injury} open={isEditOpen} onOpenChange={setIsEditOpen} />

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Cela supprimera définitivement cette blessure de votre
              historique.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => remove.mutate(injury.id)}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
