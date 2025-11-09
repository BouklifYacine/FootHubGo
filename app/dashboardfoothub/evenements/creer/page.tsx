import { MiddlewareUtilisateurNonConnecte } from "@/app/(middleware)/MiddlewareUtilisateurNonConnecte";
import { requireUserWithClub } from "@/app/(middleware)/requireUserWithClub";
import FormulaireCreerEvenement from "@/features/evenements/components/FormulaireCreerEvenement";
import { prisma } from "@/prisma";
import { redirect } from "next/navigation";

async function CreerEvenement() {
  const session = await MiddlewareUtilisateurNonConnecte();
  await requireUserWithClub()

  const DataRoleUser = await prisma.membreEquipe.findFirst(({
      where : {userId : session?.user.id },
      select : {role : true}
    }))
    
    if (DataRoleUser?.role !== "ENTRAINEUR") redirect("/dashboardfoothub/evenements")

  return (
    <>
      <FormulaireCreerEvenement />
    </>
  );
}

export default CreerEvenement;