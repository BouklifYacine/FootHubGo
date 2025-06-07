type Joueur = {
  id: string;
  nom: string;
  image: string | null;
};

type Equipe = {
  id: string;
  nom: string;
  logoUrl: string | null;
};

type Stats = {
  totalMatchs: number;
  matchsTitulaire: number;
  totalButs: number;
  totalPasses: number;
  GA: number;
  GA_Match: number;
  noteMoyenne: number;
  tempsJeuTotal: number;
  butsPar90: number;
  passesPar90: number;
  GAPar90: number;
};

type JoueurAvecStats = {
  joueur: Joueur;
  equipe: Equipe | null;
  stats: Stats;
};

export type Classementjoueurreponse = {
  totalJoueurs: number;
  classement: JoueurAvecStats[];
};
