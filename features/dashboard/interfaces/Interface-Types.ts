export type Role = "Admin" | "utilisateur";

interface Abonnement {
  periode: "mois" | "année";
  datedebut: Date;
  datefin: Date;
}
export interface Utilisateur {
  id: string;
  image?: string | null;
  name: string | null;
  email: string | null;
  plan: "pro" | "free";
  role: "Admin" | "utilisateur";
  createdAt: Date;
  abonnement?: Abonnement | null;
}

interface StatsAbonnement {
  nombre: number;
  revenus: number;
}

interface Statistiques {
  totalUtilisateurs: number;
  totalAbonnements: number;
  totalRevenus: number;
  statsAbonnements: {
    annuels: StatsAbonnement;
    mensuels: StatsAbonnement;
  };
}

export interface TableauDeBordProps {
  utilisateurs: Utilisateur[];
  statistiques: Statistiques;
  MRR: number;
  RevenusParUtilisateurs: number;
  page: number;
  setPage: (value: number | ((prevValue: number) => number)) => void;
  totalPages: number; 
}