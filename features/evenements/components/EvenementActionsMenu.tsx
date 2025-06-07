"use client";

import { Evenement } from "../(types)/EvenementsResponse";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PencilIcon, Trash2, Loader2, ListPlus } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EvenementActionsMenuProps {
  evenement: Evenement;
  equipeId: string;
  isDeletePending: boolean;
  isSuppressionStatsEquipePending: boolean;
  evenementASupprimer: string | null;
  evenementStatsEquipe: string | null;
  handleAjouterStatsEquipe: (id: string) => void;
  handleModifierStatsEquipe: (id: string) => void;
  handleDeleteStatsEquipe: (id: string) => void;
  handleDeleteEvenement: (id: string) => void;
}

export default function EvenementActionsMenu({
  evenement,
  equipeId,
  isDeletePending,
  isSuppressionStatsEquipePending,
  evenementASupprimer,
  evenementStatsEquipe,
  handleAjouterStatsEquipe,
  handleModifierStatsEquipe,
  handleDeleteStatsEquipe,
  handleDeleteEvenement
}: EvenementActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <MoreHorizontal className="h-4 w-4 mr-1" />
          Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {/* Actions de statistiques d'équipe (uniquement pour les matchs) */}
        {evenement.typeEvenement === "MATCH" && (
          <>
            {!evenement.statistiquesEquipe ? (
              <DropdownMenuItem 
                onClick={() => handleAjouterStatsEquipe(evenement.id)}
                className="cursor-pointer"
              >
                <ListPlus className="h-4 w-4 mr-2" />
                Ajouter stats équipe
              </DropdownMenuItem>
            ) : (
              <>
                <DropdownMenuItem 
                  onClick={() => handleModifierStatsEquipe(evenement.id)}
                  className="cursor-pointer"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Modifier stats équipe
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleDeleteStatsEquipe(evenement.id)}
                  className="cursor-pointer text-red-600"
                  disabled={isSuppressionStatsEquipePending}
                >
                  {isSuppressionStatsEquipePending && evenementStatsEquipe === evenement.id ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Supprimer stats équipe
                </DropdownMenuItem>
              </>
            )}
          </>
        )}

        {/* Actions communes à tous les types d'événements */}
        <DropdownMenuItem 
          asChild
          className="cursor-pointer"
        >
          <Link href={`/dashboardclient/equipe/${equipeId}/evenements/${evenement.id}/modifier`}>
            <PencilIcon className="h-4 w-4 mr-2" />
            Modifier événement
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleDeleteEvenement(evenement.id)}
          className="cursor-pointer text-red-600"
          disabled={isDeletePending}
        >
          {isDeletePending && evenementASupprimer === evenement.id ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4 mr-2" />
          )}
          Supprimer événement
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 