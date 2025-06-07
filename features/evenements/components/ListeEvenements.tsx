"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Trash2 } from "lucide-react";
import { useEvenementsEquipe } from "../(hooks)/UseEvenement-Equipe";
import { useDeleteEvenement } from "../(hooks)/UseDeleteEvenement";
import { FiltreEvenements } from "@/app/(schema)/SchemaEvenementv2";
import { Pagination } from "./Pagination";
import { Evenement } from "../(types)/EvenementsResponse";
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
import { useSupprimerStatistiqueJoueur } from "../../statistiquesjoueur/(hook)/UseStatistiquejoueur";
import { useSupprimerStatistiqueEquipe } from "../../statistiquesequipe/(hook)/useStatistiqueEquipe";
import FormulaireStatistiquesJoueur from "../../statistiquesjoueur/(components)/FormulaireStatistiquesJoueur";
import FormulaireStatistiquesEquipe from "../../statistiquesequipe/(components)/FormulaireStatistiquesEquipe";
import EvenementCard from "./EvenementCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ListeEvenementsProps {
  equipeId: string;
  estEntraineur?: boolean;
}

export default function ListeEvenements({ equipeId, estEntraineur = false }: ListeEvenementsProps) {
  const [filtres, setFiltres] = useState<FiltreEvenements>({
    type: "TOUS",
    page: 1,
    limit: 5
  });
  const [evenementASupprimer, setEvenementASupprimer] = useState<string | null>(null);
  const [dialogSuppressionOuvert, setDialogSuppressionOuvert] = useState(false);
  const [dialogSuppressionStatsOuvert, setDialogSuppressionStatsOuvert] = useState(false);
  const [evenementStatsASupprimer, setEvenementStatsASupprimer] = useState<string | null>(null);
  const [evenementAModifier, setEvenementAModifier] = useState<string | null>(null);
  const [dialogModifierStatsOuvert, setDialogModifierStatsOuvert] = useState(false);
  
  // États pour les statistiques d'équipe
  const [dialogAjouterStatsEquipeOuvert, setDialogAjouterStatsEquipeOuvert] = useState(false);
  const [dialogModifierStatsEquipeOuvert, setDialogModifierStatsEquipeOuvert] = useState(false);
  const [dialogSuppressionStatsEquipeOuvert, setDialogSuppressionStatsEquipeOuvert] = useState(false);
  const [evenementStatsEquipe, setEvenementStatsEquipe] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<string>("a-venir");

  const { data, isLoading, isError, error } = useEvenementsEquipe(equipeId, filtres);
  const { deleteEvenement, isPending: isDeletePending } = useDeleteEvenement(equipeId);
  const { mutate: supprimerStats, isPending: isSuppressionStatsPending } = useSupprimerStatistiqueJoueur();
  const { mutate: supprimerStatsEquipe, isPending: isSuppressionStatsEquipePending } = useSupprimerStatistiqueEquipe();

  // Vérifier si la page actuelle est valide par rapport au nombre total de pages
  const totalPages = data?.pagination?.pages || 1;
  
  // Calculer la page courante en tenant compte des limites
  const currentPage = (data?.pagination && filtres.page > data.pagination.pages && data.pagination.pages > 0) 
    ? 1 
    : (data?.pagination?.page || filtres.page);

  const handleTypeChange = (value: string) => {
    if (value === "TOUS" || value === "MATCH" || value === "ENTRAINEMENT") {
      setFiltres(prev => ({ ...prev, type: value, page: 1 }));
    }
  };

  const handlePageChange = (page: number) => {
    const pageToSet = Math.min(Math.max(1, page), totalPages);
    setFiltres(prev => ({ ...prev, page: pageToSet }));
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setFiltres(prev => ({ ...prev, page: 1 }));
  };

  const handleDeleteEvenement = (evenementId: string) => {
    setEvenementASupprimer(evenementId);
    setDialogSuppressionOuvert(true);
  };

  const confirmDeleteEvenement = () => {
    if (evenementASupprimer) {
      deleteEvenement(evenementASupprimer);
      setDialogSuppressionOuvert(false);
    }
  };

  const handleDeleteStats = (evenementId: string) => {
    setEvenementStatsASupprimer(evenementId);
    setDialogSuppressionStatsOuvert(true);
  };

  const confirmDeleteStats = () => {
    if (evenementStatsASupprimer) {
      supprimerStats(evenementStatsASupprimer);
      setDialogSuppressionStatsOuvert(false);
    }
  };

  const handleModifierStats = (evenementId: string) => {
    setEvenementAModifier(evenementId);
    setDialogModifierStatsOuvert(true);
  };

  // Fonctions pour gérer les statistiques d'équipe
  const handleAjouterStatsEquipe = (evenementId: string) => {
    setEvenementStatsEquipe(evenementId);
    setDialogAjouterStatsEquipeOuvert(true);
  };

  const handleModifierStatsEquipe = (evenementId: string) => {
    setEvenementStatsEquipe(evenementId);
    setDialogModifierStatsEquipeOuvert(true);
  };

  const handleDeleteStatsEquipe = (evenementId: string) => {
    setEvenementStatsEquipe(evenementId);
    setDialogSuppressionStatsEquipeOuvert(true);
  };

  const confirmDeleteStatsEquipe = () => {
    if (evenementStatsEquipe) {
      supprimerStatsEquipe({ evenementId: evenementStatsEquipe, equipeId });
      setDialogSuppressionStatsEquipeOuvert(false);
    }
  };

  // Fonction pour rendre la liste des événements
  const renderEvenements = (evenements: Evenement[]) => {
    if (evenements.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          Aucun événement à afficher
        </div>
      );
    }

    return (
      <div className="space-y-4 mt-4">
        {evenements.map((evenement) => (
          <EvenementCard
            key={evenement.id}
            evenement={evenement}
            equipeId={equipeId}
            estEntraineur={estEntraineur}
            isDeletePending={isDeletePending}
            isSuppressionStatsPending={isSuppressionStatsPending}
            isSuppressionStatsEquipePending={isSuppressionStatsEquipePending}
            evenementASupprimer={evenementASupprimer}
            evenementStatsASupprimer={evenementStatsASupprimer}
            evenementStatsEquipe={evenementStatsEquipe}
            handleModifierStats={handleModifierStats}
            handleDeleteStats={handleDeleteStats}
            handleAjouterStatsEquipe={handleAjouterStatsEquipe}
            handleModifierStatsEquipe={handleModifierStatsEquipe}
            handleDeleteStatsEquipe={handleDeleteStatsEquipe}
            handleDeleteEvenement={handleDeleteEvenement}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return <div className="text-center py-8">Chargement des événements...</div>;
  }

  if (isError) {
    return (
      <div className="text-center py-8 text-red-500">
        Erreur: {error instanceof Error ? error.message : "Une erreur est survenue"}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Événements</h2>
          <Select 
            value={filtres.type}
            onValueChange={handleTypeChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type d'événement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TOUS">Tous</SelectItem>
              <SelectItem value="MATCH">Matchs</SelectItem>
              <SelectItem value="ENTRAINEMENT">Entraînements</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="a-venir" value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="a-venir">À venir ({data?.evenementsAVenir.length || 0})</TabsTrigger>
            <TabsTrigger value="passes">Passés ({data?.evenementsPassés.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="a-venir">
            {renderEvenements(data?.evenementsAVenir || [])}
          </TabsContent>

          <TabsContent value="passes">
            {renderEvenements(data?.evenementsPassés || [])}
          </TabsContent>
        </Tabs>

        {data?.pagination && (
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={handlePageChange} 
          />
        )}
      </div>

      {/* Dialog de suppression d'événement */}
      <AlertDialog open={dialogSuppressionOuvert} onOpenChange={setDialogSuppressionOuvert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cet événement ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes les données associées à cet événement (présences, statistiques) seront également supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteEvenement}
              className="bg-red-600 hover:bg-red-700 text-white flex items-center"
              disabled={isDeletePending}
            >
              {isDeletePending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={dialogSuppressionStatsOuvert} onOpenChange={setDialogSuppressionStatsOuvert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer vos statistiques ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera définitivement vos statistiques pour cet événement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteStats}
              className="bg-red-600 hover:bg-red-700 text-white flex items-center"
              disabled={isSuppressionStatsPending}
            >
              {isSuppressionStatsPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de modification des statistiques joueur */}
      <Dialog open={dialogModifierStatsOuvert} onOpenChange={setDialogModifierStatsOuvert}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier vos statistiques</DialogTitle>
          </DialogHeader>
          {evenementAModifier && (
            <FormulaireStatistiquesJoueur 
              evenementId={evenementAModifier} 
              isModification={true}
              onSubmitSuccess={() => setDialogModifierStatsOuvert(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog d'ajout de statistiques d'équipe */}
      <Dialog open={dialogAjouterStatsEquipeOuvert} onOpenChange={setDialogAjouterStatsEquipeOuvert}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter les statistiques de l&apos;équipe</DialogTitle>
          </DialogHeader>
          {evenementStatsEquipe && (
            <FormulaireStatistiquesEquipe 
              evenementId={evenementStatsEquipe}
              equipeId={equipeId}
              onSubmitSuccess={() => setDialogAjouterStatsEquipeOuvert(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de modification des statistiques d'équipe */}
      <Dialog open={dialogModifierStatsEquipeOuvert} onOpenChange={setDialogModifierStatsEquipeOuvert}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier les statistiques de l&apos;équipe</DialogTitle>
          </DialogHeader>
          {evenementStatsEquipe && (
            <FormulaireStatistiquesEquipe 
              evenementId={evenementStatsEquipe}
              equipeId={equipeId}
              isModification={true}
              onSubmitSuccess={() => setDialogModifierStatsEquipeOuvert(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={dialogSuppressionStatsEquipeOuvert} onOpenChange={setDialogSuppressionStatsEquipeOuvert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer les statistiques d&apos;équipe ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera définitivement les statistiques d&apos;équipe pour cet événement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteStatsEquipe}
              className="bg-red-600 hover:bg-red-700 text-white flex items-center"
              disabled={isSuppressionStatsEquipePending}
            >
              {isSuppressionStatsEquipePending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}