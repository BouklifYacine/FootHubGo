import { PosteJoueur, NiveauClub } from "@prisma/client";


export function formatPosteJoueur(poste: PosteJoueur | string): string {
  const formattedPositions: Record<string, string> = {
    GARDIEN: "Gardien",
    DEFENSEUR_LATERAL_DROIT: "Défenseur Latéral Droit",
    DEFENSEUR_CENTRAL: "Défenseur Central",
    DEFENSEUR_LATERAL_GAUCHE: "Défenseur Latéral Gauche",
    MILIEU_DEFENSIF: "Milieu Défensif",
    MILIEU_CENTRAL: "Milieu Central",
    MILIEU_OFFENSIF: "Milieu Offensif",
    MILIEU_RECUPERATEUR: "Milieu Récupérateur",
    MILIEU_RELAYEUR: "Milieu Relayeur",
    ATTAQUANT_DE_POINTE: "Attaquant de Pointe",
    ATTAQUANT_DE_SOUTIEN: "Attaquant de Soutien",
    AILIER_GAUCHE: "Ailier Gauche",
    AILIER_DROIT: "Ailier Droit",
    SECOND_ATTAQUANT: "Second Attaquant",
  };

  return formattedPositions[poste] || poste;
}

export function formatNiveauClub(niveau: NiveauClub | string): string {
  const formattedLevels: Record<string, string> = {
    DEPARTEMENTAL_1: "Départemental 1",
    DEPARTEMENTAL_2: "Départemental 2",
    DEPARTEMENTAL_3: "Départemental 3",
    REGIONAL_1: "Régional 1",
    REGIONAL_2: "Régional 2",
    REGIONAL_3: "Régional 3",
    NATIONAL_1: "National 1",
    NATIONAL_2: "National 2",
    NATIONAL_3: "National 3",
    LOISIR: "Loisir",
  };

  return formattedLevels[niveau] || niveau;
}

export function getFormattedPosteOptions() {
  const postes: PosteJoueur[] = [
    "GARDIEN",
    "DEFENSEUR_LATERAL_DROIT",
    "DEFENSEUR_CENTRAL",
    "DEFENSEUR_LATERAL_GAUCHE",
    "MILIEU_DEFENSIF",
    "MILIEU_CENTRAL",
    "MILIEU_OFFENSIF",
    "MILIEU_RECUPERATEUR",
    "MILIEU_RELAYEUR",
    "ATTAQUANT_DE_POINTE",
    "ATTAQUANT_DE_SOUTIEN",
    "AILIER_GAUCHE",
    "AILIER_DROIT",
    "SECOND_ATTAQUANT",
  ];

  return postes.map((poste) => ({
    value: poste,
    label: formatPosteJoueur(poste),
  }));
}


export function getFormattedNiveauOptions() {
  const niveaux: NiveauClub[] = [
    "DEPARTEMENTAL_1",
    "DEPARTEMENTAL_2",
    "DEPARTEMENTAL_3",
    "REGIONAL_1",
    "REGIONAL_2",
    "REGIONAL_3",
    "NATIONAL_1",
    "NATIONAL_2",
    "NATIONAL_3",
    "LOISIR",
  ];

  return niveaux.map((niveau) => ({
    value: niveau,
    label: formatNiveauClub(niveau),
  }));
}
