import { MiddlewareUtilisateurNonConnecte } from "@/app/(middleware)/MiddlewareUtilisateurNonConnecte";
import ListeEvenement from "@/features/evenements/components/ListeEvenement";

async function Evenements() {
  await MiddlewareUtilisateurNonConnecte();

  return (
    <>
   <ListeEvenement></ListeEvenement>
    </>
  );
}

export default Evenements;
