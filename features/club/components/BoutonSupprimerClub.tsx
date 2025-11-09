"use client";

import { useSupprimerClub } from "../hooks/useSupprimerClub";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Props {
  equipeid: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideButton?: boolean;
}

function BoutonSupprimerClub({ 
  equipeid, 
  open: externalOpen, 
  onOpenChange: externalOnOpenChange, 
  hideButton = false 
}: Props) {
  const { mutate, isPending } = useSupprimerClub();
  
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;

  const supprimerClub = () => {
    mutate(equipeid, {
      onSuccess: () => {
        setOpen(false); 
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {!hideButton && (
        <AlertDialogTrigger asChild>
          <Button
            size="icon"
            className="rounded-xl "
          >
            <Trash2 size={16} className="text-red-500" />
          </Button>
        </AlertDialogTrigger>
      )}
      
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Voulez-vous supprimer votre club ?</AlertDialogTitle>
          <AlertDialogDescription >
             En cliquant sur confirmer, vous allez supprimer votre club et toutes ses données. 
            Aucune récupération des informations ne sera possible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={supprimerClub}
            disabled={isPending}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {isPending ? "Suppression..." : "Confirmer la suppression"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default BoutonSupprimerClub;
