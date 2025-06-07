export interface MembreEquipe {
  id: string;
  role: "SANSCLUB" | "ENTRAINEUR" | "JOUEUR";
  posteJoueur?: "GARDIEN" | "DEFENSEUR" | "MILIEU" | "ATTAQUANT" | null;
  dateAdhesion: Date;
  userId: string;
  equipeId: string;
  user?: {
    name: string | null;
    image: string | null;
    email: string | null;
  };
}

export interface Equipe {
  id: string;
  nom: string;
  description?: string | null;
  logoUrl?: string | null;
  dateCreation: Date;
  codeInvitation?: string | null;
  membres: MembreEquipe[];
}

export interface EquipeResponse {
  ListeEquipe: Equipe;
  userId: string;
}