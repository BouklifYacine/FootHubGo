import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
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

interface Props {
  supprimer: () => void;
  disabled: boolean;
}

function BoutonSupprimer({ supprimer, disabled }: Props) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          className="bg-red-500 text-white hover:bg-red-600 cursor-pointer"
          disabled={disabled}
        >
          <Trash2
            className="text-white"
            size={16}
            strokeWidth={2}
            aria-hidden="true"
          />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Exclure ce joueur ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est définitive. Le joueur sera immédiatement retiré du
            club et ne pourra plus y accéder.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={supprimer}
            className="bg-red-500 hover:bg-red-600"
          >
            Exclure
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { BoutonSupprimer };
