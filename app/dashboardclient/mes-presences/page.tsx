"use client";

import { usePresencesUtilisateur, useSupprimerPresence, useModifierPresence } from "../(hooks)/usePresence";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarIcon, MapPinIcon, Pencil, Trash2, MoreHorizontal, Check } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { StatutPresence } from "../(interface-types)/Presence";
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function MesPresencesPage() {
  const { data: presences, isLoading, error, isError } = usePresencesUtilisateur();
  const { mutate: supprimerPresence, isPending: isSuppressionEnCours } = useSupprimerPresence();
  const { mutate: modifierPresence, isPending: isModificationEnCours } = useModifierPresence();
  
  const [presenceAModifier, setPresenceAModifier] = useState<{evenementId: string, statut: StatutPresence} | null>(null);
  const [presenceASupprimer, setPresenceASupprimer] = useState<string | null>(null);
  const [statutSelectionne, setStatutSelectionne] = useState<StatutPresence>("EN_ATTENTE");
  const [dialogModificationOuvert, setDialogModificationOuvert] = useState(false);
  const [dialogSuppressionOuvert, setDialogSuppressionOuvert] = useState(false);

  // Si une erreur se produit, on affiche un toast mais sans useEffect
  if (isError && error instanceof Error) {
    toast.error(`Erreur: ${error.message}`);
  }

  // Fonction pour obtenir la couleur du badge selon le statut
  const getCouleurStatut = (statut: string) => {
    switch (statut) {
      case "PRESENT":
        return "bg-green-500";
      case "ABSENT":
        return "bg-red-500";
      case "INCERTAIN":
        return "bg-yellow-500";
      default:
        return "bg-gray-400";
    }
  };

  // Fonction pour traduire le statut
  const getTexteStatut = (statut: string) => {
    switch (statut) {
      case "PRESENT":
        return "Présent";
      case "ABSENT":
        return "Absent";
      case "INCERTAIN":
        return "Incertain";
      default:
        return "En attente";
    }
  };

  // Fonction pour afficher le type d'événement
  const getTypeEvenement = (type: string) => {
    switch (type) {
      case "MATCH":
        return "Match";
      case "ENTRAINEMENT":
        return "Entraînement";
      default:
        return type;
    }
  };

  // Ouvrir la boîte de dialogue de modification
  const ouvrirModification = (evenementId: string, statutActuel: StatutPresence) => {
    setPresenceAModifier({ evenementId, statut: statutActuel });
    setStatutSelectionne(statutActuel);
    setDialogModificationOuvert(true);
  };

  // Ouvrir la boîte de dialogue de suppression
  const ouvrirSuppression = (evenementId: string) => {
    setPresenceASupprimer(evenementId);
    setDialogSuppressionOuvert(true);
  };

  // Fonction pour confirmer la modification
  const confirmerModification = () => {
    if (presenceAModifier && statutSelectionne) {
      modifierPresence(
        { evenementId: presenceAModifier.evenementId, statut: statutSelectionne },
        {
          onSuccess: (resultat) => {
            if (resultat.success) {
              toast.success(resultat.message);
              setDialogModificationOuvert(false);
            } else {
              toast.error(resultat.message);
            }
          },
          onError: () => {
            toast.error("Une erreur est survenue lors de la modification de votre présence");
          }
        }
      );
    }
  };

  // Fonction pour confirmer la suppression
  const confirmerSuppression = () => {
    if (presenceASupprimer) {
      supprimerPresence(
        { evenementId: presenceASupprimer },
        {
          onSuccess: (resultat) => {
            if (resultat.success) {
              toast.success(resultat.message);
              setDialogSuppressionOuvert(false);
            } else {
              toast.error(resultat.message);
            }
          },
          onError: () => {
            toast.error("Une erreur est survenue lors de la suppression de votre présence");
          }
        }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-bold">Mes Présences</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Mes Présences</h1>

      {presences && presences.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {presences.map((presence, index) => (
            <Card key={index} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{presence.titre}</CardTitle>
                    <CardDescription>
                      {getTypeEvenement(presence.typeEvenement)}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getCouleurStatut(presence.statut)} variant="secondary">
                      {getTexteStatut(presence.statut)}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => ouvrirModification(presence.evenementId, presence.statut)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Modifier ma présence
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => ouvrirSuppression(presence.evenementId)}
                          className="text-red-500 focus:text-red-500"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Retirer ma présence
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {presence.description && (
                    <p className="text-sm text-gray-500">{presence.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <CalendarIcon className="h-4 w-4" />
                    <span>
                      {format(new Date(presence.dateDebut), "d MMMM yyyy à HH:mm", { locale: fr })}
                    </span>
                  </div>
                  {presence.lieu && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPinIcon className="h-4 w-4" />
                      <span>{presence.lieu}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-blue-50 p-6 rounded-lg text-center shadow-md">
          <p className="text-lg text-blue-800 mb-2">Vous n&apos;avez pas encore de présences enregistrées.</p>
          <p className="text-sm text-blue-600">
            Participez à des événements et indiquez votre présence pour les voir apparaître ici.
          </p>
        </div>
      )}

      <Dialog open={dialogModificationOuvert} onOpenChange={setDialogModificationOuvert}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier ma présence</DialogTitle>
            <DialogDescription>
              Choisissez votre disponibilité pour cet événement
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <RadioGroup
              value={statutSelectionne}
              onValueChange={(value) => setStatutSelectionne(value as StatutPresence)}
              className="flex flex-col space-y-3"
            >
              <div className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="PRESENT" id="present-dialog" />
                <Label
                  htmlFor="present-dialog"
                  className="flex items-center cursor-pointer justify-between flex-1"
                >
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Présent</span>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="ABSENT" id="absent-dialog" />
                <Label
                  htmlFor="absent-dialog"
                  className="flex items-center cursor-pointer justify-between flex-1"
                >
                  <div className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4 text-red-500" />
                    <span>Absent</span>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="INCERTAIN" id="incertain-dialog" />
                <Label
                  htmlFor="incertain-dialog"
                  className="flex items-center cursor-pointer justify-between flex-1"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 text-yellow-500">?</div>
                    <span>Incertain</span>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="EN_ATTENTE" id="en-attente-dialog" />
                <Label
                  htmlFor="en-attente-dialog"
                  className="flex items-center cursor-pointer justify-between flex-1"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 text-gray-400">...</div>
                    <span>En attente</span>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button 
              onClick={confirmerModification} 
              disabled={isModificationEnCours || statutSelectionne === presenceAModifier?.statut}
            >
              {isModificationEnCours ? "Modification..." : "Confirmer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogSuppressionOuvert} onOpenChange={setDialogSuppressionOuvert}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Supprimer ma présence</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer votre présence à cet événement ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={confirmerSuppression} 
              disabled={isSuppressionEnCours}
            >
              {isSuppressionEnCours ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 