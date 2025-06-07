import z from "zod";
import { StatistiqueJoueurSchema } from "../schemas/SchemasStatistiqueJoueur";

export type StatistiqueJoueurInputs = z.infer<typeof StatistiqueJoueurSchema>;

export interface StatistiqueEvenement {
  id: string;
  evenementId: string;
  userId: string;
  buts: number;
  passes: number;
  minutesJouees: number;
  note: number;
  titulaire: boolean;
  poste: string;
}

  export interface StatistiquesGlobales {
    totalMatchs: number;
    totalButs: number;
    totalPasses: number;
    matchsTitulaire: number;
    noteMoyenne: number;
    GA_TOTAL: number;
    GA_Match: string | number;
    tempsJeuTotal: number;
    butsPar90: string;
    passesPar90: string;
    GAPar90: string;
  }

  export interface StatistiquesJoueurResponse {
    statistiquesGlobales: StatistiquesGlobales;
    // Décommentez ces lignes quand je ferais la V2
    // statsParPoste: StatsParPoste;
    // detailMatchs: DetailMatch[];
  }

  export interface StatistiqueJoueur {
  id: string;
  buts: number;
  passesdécisive: number;
  minutesJouees: number;
  note: number;
  titulaire: boolean;
  poste: string;
}
