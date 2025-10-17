import { GetSessionUtilisateur } from "./GetSessionUtilisateur";

export type RoleJoueurEquipetype = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "utilisateur" | "Admin";
  plan: "free" | "pro";
  roleEquipe: "SANSCLUB" | "JOUEUR" | "ENTRAINEUR";
  equipeId?: string;
  equipeNom?: string;
  equipeLogo?: string | null;
};

export async function RoleJoueurEquipe() {
  const utilisateur = await GetSessionUtilisateur();

  if (!utilisateur) return null;

  const donnéesUtilisateur: RoleJoueurEquipetype = {
    id: utilisateur.id,
    name: utilisateur.name || "",
    email: utilisateur.email || "",
    avatar: utilisateur.image || "",
    role: utilisateur.role,
    plan: utilisateur.plan,
    roleEquipe: utilisateur.MembreEquipe.map,
    equipeId: utilisateur.membreEquipe?.equipe?.id,
    equipeNom: utilisateur.membreEquipe?.equipe?.nom,
    equipeLogo: utilisateur.membreEquipe?.equipe?.logoUrl
  };

  return donnéesUtilisateur;
}