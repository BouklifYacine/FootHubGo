"use client";

import { useRouter } from "next/navigation";
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
import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { deleteTeam } from "../actions";

type Props = { open: boolean; onOpenChange: (open: boolean) => void };

export function DeleteTeamDialog({ open, onOpenChange }: Props) {
  const router = useRouter();
  const remove = useActionMutation(deleteTeam, {
    invalidate: [queryKeys.me.all, queryKeys.home, queryKeys.teams.all],
    onSuccess: () => {
      onOpenChange(false);
      router.push("/app");
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Voulez-vous supprimer votre club ?</AlertDialogTitle>
          <AlertDialogDescription>
            Le club et toutes ses données (événements, statistiques, messages) seront supprimés
            définitivement. Aucune récupération ne sera possible.
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
