"use client";

import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Users, Filter, Trophy,  } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { BoutonModifierEquipe } from "./ModifierEquipe";
import { BoutonSupprimerEquipe } from "./BoutonSuppressionClub";
import { GestionCodeInvitation } from "./GestionCodeInvitation";
import { BoutonQuitterEquipe } from "./BoutonQuitterEquipe";
import FiltreRole from "./FiltreRole";
import FiltrePoste from "./FiltrePoste";
import Loading from "./Loading";
import Erreur from "./Erreur";
import TableauMembresEquipe from "./Tableau";
import ConfirmationSuppressionDialog from "./ConfirmationSuppressionDialog";
import BlocAffichageEquipe from "./BlocAffichageEquipe";

interface MembreEquipeProps {
  equipeId: string;
}

export function MembreEquipe({ equipeId }: MembreEquipeProps) {
  const { data, isLoading, isError } = useMembreEquipe(equipeId);
  const [rechercheNom, setRechercheNom] = useState("");
  const [filtreRole, setFiltreRole] = useState("TOUS");
  const [filtrePoste, setFiltrePoste] = useState("TOUS");

  if (isLoading || !data) {
    return ( <Loading/>);
  }

  if (isError) {
    return (<Erreur></Erreur>);
  }

  const { ListeEquipe } = data;

  const userId = data.userId;
  const membreConnecte = ListeEquipe.membres.find(
    (membre) => membre.userId === userId
  );
  const estEntraineur = membreConnecte?.role === "ENTRAINEUR";

  const membresFiltres = ListeEquipe.membres.filter(
    (membre: MembreequipeType) => {
      const correspondanceNom = membre.user?.name
        ? membre.user.name.toLowerCase().includes(rechercheNom.toLowerCase())
        : false;

      const correspondanceRole =
        filtreRole === "TOUS" || membre.role === filtreRole;

      const correspondancePoste =
        filtrePoste === "TOUS" ||
        (filtrePoste === "AUCUN" && !membre.posteJoueur) ||
        membre.posteJoueur === filtrePoste;

      return (
        (rechercheNom === "" || correspondanceNom) &&
        correspondanceRole &&
        correspondancePoste
      );
    }
  );

  const nombreEntraineurs = ListeEquipe.membres.filter(
    (m) => m.role === "ENTRAINEUR"
  ).length;
  const nombreJoueurs = ListeEquipe.membres.filter(
    (m) => m.role === "JOUEUR"
  ).length;

  

  const MembreActions = ({ membre }: { membre: MembreequipeType }) => {
    const modifierRoleMutation = useModifierRoleEtPoste(equipeId);
    const supprimerMembreMutation = useSupprimerMembreDEquipe(equipeId);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const estMembreConnecte = membre.userId === userId;

    if (!estEntraineur) return null;

    const handleDeleteConfirm = () => {
      supprimerMembreMutation.mutate(membre.userId);
      setIsDialogOpen(false);
    };

    return (
      <div className="flex items-center gap-2">
        <Select
          value={membre.role}
          onValueChange={(role: "ENTRAINEUR" | "JOUEUR") => {
            modifierRoleMutation.mutate({
              membreId: membre.userId,
              role,
              posteJoueur:
                role === "JOUEUR" ? membre.posteJoueur || undefined : undefined,
            });
          }}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ENTRAINEUR">Entraineur</SelectItem>
            <SelectItem value="JOUEUR">Joueur</SelectItem>
          </SelectContent>
        </Select>

        {membre.role === "JOUEUR" && (
          <Select
            value={membre.posteJoueur || ""}
            onValueChange={(
              poste: "GARDIEN" | "DEFENSEUR" | "MILIEU" | "ATTAQUANT"
            ) => {
              modifierRoleMutation.mutate({
                membreId: membre.userId,
                role: "JOUEUR",
                posteJoueur: poste,
              });
            }}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Poste" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GARDIEN">Gardien</SelectItem>
              <SelectItem value="DEFENSEUR">Défenseur</SelectItem>
              <SelectItem value="MILIEU">Milieu</SelectItem>
              <SelectItem value="ATTAQUANT">Attaquant</SelectItem>
            </SelectContent>
          </Select>
        )}

        {!estMembreConnecte && (
           <ConfirmationSuppressionDialog
           isOpen={isDialogOpen}
           setIsOpen={setIsDialogOpen}
           nomMembre={membre.user?.name}
           onConfirm={handleDeleteConfirm}
           isLoading={supprimerMembreMutation.isPending}
         />
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/30 py-3">
          <div className="flex flex-col md:flex-row justify-between items-start gap-3">
            <div className="flex items-center gap-3">
              {ListeEquipe.logoUrl ? (
                <Avatar className="h-12 w-12 border-2 border-primary/20">
                  <AvatarImage
                    src={ListeEquipe.logoUrl}
                    alt={ListeEquipe.nom}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {ListeEquipe.nom.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
              )}
              <div>
                <CardTitle className="text-2xl">{ListeEquipe.nom}</CardTitle>
                {ListeEquipe.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {ListeEquipe.description}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex flex-col w-full md:w-auto">
              <div className="self-end">
                {estEntraineur && (
                  <GestionCodeInvitation
                    equipeId={equipeId}
                    codeInvitation={ListeEquipe.codeInvitation}
                    estEntraineur={estEntraineur}
                  />
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 mt-2 self-end">
                {estEntraineur && (
                  <>
                    <BoutonModifierEquipe
                      equipeId={equipeId}
                      equipe={ListeEquipe}
                    />
                    <BoutonSupprimerEquipe
                      equipeId={equipeId}
                      nomEquipe={ListeEquipe.nom}
                    />
                  </>
                )}
                <BoutonQuitterEquipe
                  equipeId={equipeId}
                  nomEquipe={ListeEquipe.nom}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 pb-3">
          <BlocAffichageEquipe nombreEntraineurs={nombreEntraineurs} nombreJoueurs={nombreJoueurs} ListeEquipe={ListeEquipe} ></BlocAffichageEquipe>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>Membres de l'équipe</span>
              <Badge variant="outline" className="ml-2">
                {ListeEquipe.membres.length}
              </Badge>
            </CardTitle>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-44">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un membre..."
                  value={rechercheNom}
                  onChange={(e) => setRechercheNom(e.target.value)}
                  className="pl-8 h-9 text-sm"
                />
              </div>
              
         <FiltreRole filtreRole={filtreRole} setFiltreRole={setFiltreRole} ></FiltreRole>
         <FiltrePoste filtrePoste={filtrePoste} setFiltrePoste={setFiltrePoste}></FiltrePoste>

            </div>
          </div>
        </CardHeader>
        <CardContent>
          {ListeEquipe.membres.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 bg-muted/20 rounded-lg">
              <Users className="h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground font-medium">
                Cette équipe n'a pas encore de membres.
              </p>
            </div>
          ) : membresFiltres.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 bg-muted/20 rounded-lg">
              <Filter className="h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground font-medium">
                Aucun membre ne correspond aux critères de filtrage.
              </p>
            </div>
          ) : (
            <TableauMembresEquipe
              membres={membresFiltres}
              estEntraineur={estEntraineur}
              MembreActions={MembreActions}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}