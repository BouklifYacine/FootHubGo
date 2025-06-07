"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, MapPinIcon } from "lucide-react";
import { Evenement } from "../(types)/EvenementsResponse";
import PresenceEvenementForm from "./PresenceEvenementForm";
import { StatutPresence } from "../../(interface-types)/Presence";
import EvenementActionsMenu from "./EvenementActionsMenu";
import StatistiquesJoueurActions from "../../statistiquesjoueur/(components)/StatistiquesJoueurActions";

interface EvenementCardProps {
  evenement: Evenement;
  equipeId: string;
  estEntraineur: boolean;
  isDeletePending: boolean;
  isSuppressionStatsPending: boolean;
  isSuppressionStatsEquipePending: boolean;
  evenementASupprimer: string | null;
  evenementStatsASupprimer: string | null;
  evenementStatsEquipe: string | null;
  handleModifierStats: (id: string) => void;
  handleDeleteStats: (id: string) => void;
  handleAjouterStatsEquipe: (id: string) => void;
  handleModifierStatsEquipe: (id: string) => void;
  handleDeleteStatsEquipe: (id: string) => void;
  handleDeleteEvenement: (id: string) => void;
}

export default function EvenementCard({
  evenement,
  equipeId,
  estEntraineur,
  isDeletePending,
  isSuppressionStatsPending,
  isSuppressionStatsEquipePending,
  evenementASupprimer,
  evenementStatsASupprimer,
  evenementStatsEquipe,
  handleModifierStats,
  handleDeleteStats,
  handleAjouterStatsEquipe,
  handleModifierStatsEquipe,
  handleDeleteStatsEquipe,
  handleDeleteEvenement
}: EvenementCardProps) {
  // Fonction pour afficher le badge de présence
  const getPresenceStatut = (statut: string | undefined) => {
    switch (statut) {
      case "PRESENT":
        return <Badge className="bg-green-500">Présent</Badge>;
      case "ABSENT":
        return <Badge className="bg-red-500">Absent</Badge>;
      case "INCERTAIN":
        return <Badge className="bg-yellow-500">Incertain</Badge>;
      default:
        return <Badge className="bg-gray-400">Non renseigné</Badge>;
    }
  };

  // Fonction pour afficher le type d'événement
  const getTypeEvenement = (type: string) => {
    switch (type) {
      case "MATCH":
        return <Badge className="bg-blue-500">Match</Badge>;
      case "ENTRAINEMENT":
        return <Badge className="bg-purple-500">Entraînement</Badge>;
      default:
        return <Badge>Autre</Badge>;
    }
  };

  return (
    <Card className={evenement.dateDebut < new Date() ? "opacity-80" : ""}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle>{evenement.titre}</CardTitle>
          {getTypeEvenement(evenement.typeEvenement)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center text-gray-500">
            <CalendarIcon size={16} className="mr-2" />
            <span>{evenement.dateDebutFormatee}</span>
          </div>
          
          {evenement.lieu && (
            <div className="flex items-center text-gray-500">
              <MapPinIcon size={16} className="mr-2" />
              <span>{evenement.lieu}</span>
            </div>
          )}
          
          {evenement.description && (
            <>
              <Separator />
              <p className="text-sm">{evenement.description}</p>
            </>
          )}
          
          <Separator />
          
          <div className="space-y-2">
            {/* Formulaire de présence ou badge de statut */}
            {evenement.dateDebut >= new Date() ? (
              <PresenceEvenementForm 
                evenementId={evenement.id} 
                statutActuel={evenement.maPresence?.statut as StatutPresence | undefined} 
              />
            ) : (
              <div className="flex items-center">
                {getPresenceStatut(evenement.maPresence?.statut)}
              </div>
            )}

            {/* Actions de l'événement */}
            <div className="mt-2 flex justify-end space-x-2">
              {/* Menu d'actions pour les entraîneurs */}
              {estEntraineur && evenement.maPresence?.statut === "PRESENT" && (
                <EvenementActionsMenu 
                  evenement={evenement}
                  equipeId={equipeId}
                  isDeletePending={isDeletePending}
                  isSuppressionStatsEquipePending={isSuppressionStatsEquipePending}
                  evenementASupprimer={evenementASupprimer}
                  evenementStatsEquipe={evenementStatsEquipe}
                  handleAjouterStatsEquipe={handleAjouterStatsEquipe}
                  handleModifierStatsEquipe={handleModifierStatsEquipe}
                  handleDeleteStatsEquipe={handleDeleteStatsEquipe}
                  handleDeleteEvenement={handleDeleteEvenement}
                />
              )}

              {/* Actions statistiques joueur */}
              {!estEntraineur && (
                <StatistiquesJoueurActions 
                  evenement={evenement}
                  isSuppressionStatsPending={isSuppressionStatsPending}
                  evenementStatsASupprimer={evenementStatsASupprimer}
                  handleModifierStats={handleModifierStats}
                  handleDeleteStats={handleDeleteStats}
                />
              )}
            </div>
          </div>
          
          {/* Afficher le menu d'actions pour les entraîneurs sur les événements non-matchs */}
          {estEntraineur && !evenement.typeEvenement.includes("MATCH") && (
            <>
              <Separator className="my-2" />
              <div className="flex justify-end space-x-2">
                <EvenementActionsMenu 
                  evenement={evenement}
                  equipeId={equipeId}
                  isDeletePending={isDeletePending}
                  isSuppressionStatsEquipePending={isSuppressionStatsEquipePending}
                  evenementASupprimer={evenementASupprimer}
                  evenementStatsEquipe={evenementStatsEquipe}
                  handleAjouterStatsEquipe={handleAjouterStatsEquipe}
                  handleModifierStatsEquipe={handleModifierStatsEquipe}
                  handleDeleteStatsEquipe={handleDeleteStatsEquipe}
                  handleDeleteEvenement={handleDeleteEvenement}
                />
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 