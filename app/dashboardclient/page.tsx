import Classement from "@/features/classementequipes/components/Classement";
import InputCodeInvitation from "@/features/codeinvitation/components/inputcodeinvitation";
import { RoleJoueurEquipe } from "@/lib/RoleJoueurEquipe";

export default async function DashboardPage() {
  const utilisateur = await RoleJoueurEquipe();

  return (
    <>
      <InputCodeInvitation utilisateur={utilisateur} />
      <Classement />
    </>
  );
}
