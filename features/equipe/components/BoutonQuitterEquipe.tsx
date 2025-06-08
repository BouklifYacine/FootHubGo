"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { useQuitterEquipe } from "../hooks/useQuitterEquipe";


interface BoutonQuitterEquipeProps {
  equipeId: string;
  nomEquipe: string;
}

export function BoutonQuitterEquipe({ equipeId, nomEquipe }: BoutonQuitterEquipeProps) {
  const quitterEquipeMutation = useQuitterEquipe();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleQuitterEquipe = () => {
    quitterEquipeMutation.mutate(
      { equipeId },
      {
        onSuccess: (result) => {
          if (result.success) {
            setIsDialogOpen(false);
          }
        }
      }
    );
  };

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          variant="outline" 
          className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Quitter l'équipe
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Quitter l'équipe {nomEquipe}</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir quitter cette équipe ? Cette action ne peut pas être annulée.
            {"\n"}
            Vous perdrez l'accès à toutes les données et événements de l'équipe.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleQuitterEquipe}
            className="bg-red-500 hover:bg-red-600"
            disabled={quitterEquipeMutation.isPending}
          >
            {quitterEquipeMutation.isPending ? "En cours..." : "Quitter"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}