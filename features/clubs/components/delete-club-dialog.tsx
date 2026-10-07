"use client";

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
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { deleteClub } from "../actions";
import { useRefreshAll } from "../hooks/use-refresh-all";

type Props = { open: boolean; onOpenChange: (open: boolean) => void };

/** OWNER only: deletes the club, its sections and all their data, and cancels the subscription. */
export function DeleteClubDialog({ open, onOpenChange }: Props) {
  const refreshAll = useRefreshAll();
  const remove = useActionMutation(deleteClub, {
    onSuccess: () => {
      onOpenChange(false);
      refreshAll("/app");
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Voulez-vous supprimer votre club ?</AlertDialogTitle>
          <AlertDialogDescription>
            Le club, toutes ses sections et leurs données (événements, statistiques, messages) seront
            supprimés définitivement et l&apos;abonnement sera résilié. Aucune récupération ne sera possible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={remove.isPending}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              remove.mutate();
            }}
            disabled={remove.isPending}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            {remove.isPending ? "Suppression..." : "Confirmer la suppression"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
