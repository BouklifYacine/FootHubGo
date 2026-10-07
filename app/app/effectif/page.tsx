import { MiddlewareUtilisateurNonConnecte } from "@/app/(middleware)/MiddlewareUtilisateurNonConnecte";
import { requireUserWithClub } from "@/app/(middleware)/requireUserWithClub";
import BlockEffectif from "@/features/club/components/BlockEffectif";
import Listemembreequipe from "@/features/club/components/listemembreequipe";

async function Effectif() {
  await MiddlewareUtilisateurNonConnecte();
  await requireUserWithClub()

  return (
    <>
      <BlockEffectif></BlockEffectif>
      <Listemembreequipe></Listemembreequipe>
    </>
  );
}

export default Effectif;
