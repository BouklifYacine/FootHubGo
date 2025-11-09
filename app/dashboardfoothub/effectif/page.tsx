import { MiddlewareUtilisateurNonConnecte } from "@/app/(middleware)/MiddlewareUtilisateurNonConnecte";
import BlockEffectif from "@/features/club/components/BlockEffectif";
import Listemembreequipe from "@/features/club/components/listemembreequipe";

async function Effectif() {
  await MiddlewareUtilisateurNonConnecte();

  return (
    <>
      <BlockEffectif></BlockEffectif>
      <Listemembreequipe></Listemembreequipe>
    </>
  );
}

export default Effectif;
