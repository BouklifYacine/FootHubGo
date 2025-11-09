import { MiddlewareUtilisateurNonConnecte } from "@/app/(middleware)/MiddlewareUtilisateurNonConnecte";
import { requireUserWithClub } from "@/app/(middleware)/requireUserWithClub";
import ListeEvenement from "@/features/evenements/components/ListeEvenement";

async function Evenements() {
  await MiddlewareUtilisateurNonConnecte();
  await requireUserWithClub()

  return (
    <>
   <ListeEvenement></ListeEvenement>
    </>
  );
}

export default Evenements;
