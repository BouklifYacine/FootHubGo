import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Users } from "lucide-react";
import React from "react";
import { MembreEquipe } from "../types/equipetypes";

export interface Equipe {
  id: string;
  nom: string;
  description?: string | null;
  logoUrl?: string | null;
  dateCreation: Date;
  codeInvitation?: string | null;
  membres: MembreEquipe[];
}

interface BlocAffichageEquipe {
  nombreEntraineurs: number;
  nombreJoueurs: number;
  ListeEquipe: Equipe;
}

const BlocAffichageEquipe = ({
  nombreEntraineurs,
  nombreJoueurs,
  ListeEquipe,
}: BlocAffichageEquipe) => {
  return (
    <>
      <div className="flex flex-col md:flex-row gap-3">
        <Card className="flex-1 bg-blue-50 border-blue-100 shadow-sm">
          <CardContent className="p-3 flex items-center gap-3">
            <Users className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-blue-700">Total Membres</p>
              <p className="text-2xl font-bold text-blue-800">
                {ListeEquipe.membres.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="flex-1 bg-red-50 border-red-100 shadow-sm">
          <CardContent className="p-3 flex items-center gap-3">
            <Trophy className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-sm font-medium text-red-700">Entraineurs</p>
              <p className="text-2xl font-bold text-red-800">
                {nombreEntraineurs}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="flex-1 bg-green-50 border-green-100 shadow-sm">
          <CardContent className="p-3 flex items-center gap-3">
            <Users className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm font-medium text-green-700">Joueurs</p>
              <p className="text-2xl font-bold text-green-800">
                {nombreJoueurs}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default BlocAffichageEquipe;
