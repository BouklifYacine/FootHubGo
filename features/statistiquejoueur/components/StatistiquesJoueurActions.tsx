"use client";

import { Button } from "@/components/ui/button";
import { PencilIcon, Trash2, Loader2 } from "lucide-react";
import FormulaireStatistiquesJoueur from "./FormulaireStatistiquesJoueur";
import { Evenement } from "@/features/evenements/types/EvenementsTypes";


interface StatistiquesJoueurActionsProps {
  evenement: Evenement;
  isSuppressionStatsPending: boolean;
  evenementStatsASupprimer: string | null;
  handleModifierStats: (id: string) => void;
  handleDeleteStats: (id: string) => void;
}

export default function StatistiquesJoueurActions({
  evenement,
  isSuppressionStatsPending,
  evenementStatsASupprimer,
  handleModifierStats,
  handleDeleteStats
}: StatistiquesJoueurActionsProps) {
  if (evenement.typeEvenement !== "MATCH" || evenement.maPresence?.statut !== "PRESENT") {
    return null;
  }

  // Si le joueur n'a pas encore de statistiques, afficher le bouton pour en ajouter
  if (!evenement.mesStatistiques) {
    return <FormulaireStatistiquesJoueur evenementId={evenement.id} />;
  }

  // Sinon, afficher les boutons pour modifier ou supprimer les statistiques
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="text-blue-600 border-blue-600 hover:bg-blue-50 hover:text-blue-700"
        onClick={() => handleModifierStats(evenement.id)}
      >
        <PencilIcon className="h-4 w-4 mr-1" />
        Modifier stats
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700"
        onClick={() => handleDeleteStats(evenement.id)}
        disabled={isSuppressionStatsPending}
      >
        {isSuppressionStatsPending && evenementStatsASupprimer === evenement.id ? (
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4 mr-1" />
        )}
        Supprimer stats
      </Button>
    </>
  );
} 