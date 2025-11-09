import { MiddlewareUtilisateurNonConnecte } from "@/app/(middleware)/MiddlewareUtilisateurNonConnecte";
import { requireUserWithClub } from "@/app/(middleware)/requireUserWithClub";
import ComponentsPageStats from "@/features/stats/statsequipe/components/ComponentsPageStats";

async function StatistiquePage() {
  await MiddlewareUtilisateurNonConnecte();
  await requireUserWithClub()
  return (
    <> <ComponentsPageStats></ComponentsPageStats></>
   
   
  );
}

export default StatistiquePage;
