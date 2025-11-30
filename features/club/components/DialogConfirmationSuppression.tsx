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

interface DialogConfirmationSuppressionProps {
  membre: { id: string; nom: string } | null;
  onConfirmer: () => void;
  onAnnuler: () => void;
}

export function DialogConfirmationSuppression({
  membre,
  onConfirmer,
  onAnnuler,
}: DialogConfirmationSuppressionProps) {
  return (
    <AlertDialog open={!!membre} onOpenChange={onAnnuler}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Exclure ce joueur ?</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir exclure <strong>{membre?.nom}</strong> du
            club ? Cette action est définitive et le joueur sera immédiatement
            retiré.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirmer}
            className="bg-red-500 hover:bg-red-600"
          >
            Exclure
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
