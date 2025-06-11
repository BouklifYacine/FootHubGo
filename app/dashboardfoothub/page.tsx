import { BoutonAjouter } from "@/components/Boutons/BoutonAjouter";
import { InputBouton } from "@/components/Inputs/InputBouton";
import { MiddlewareUtilisateurNonConnecte } from "../(middleware)/MiddlewareUtilisateurNonConnecte";
import { prisma } from "@/prisma";
import { auth } from "@/auth";
import { headers } from "next/headers";

export default async function Dashboardfoothub() {
  await MiddlewareUtilisateurNonConnecte();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = await prisma.user.findUnique({
    where: { id: session?.user.id },
    select: { MembreEquipe: true },
  });

  if (!user) return null;

  const MembreEquipe = user.MembreEquipe.length > 0;
  console.log(MembreEquipe);

  return (
    <div className="mx-8">
      <div className="flex gap-8 flex-wrap justify-between items-center">
        <BoutonAjouter texte="Créer un club" />
        {/* {MembreEquipe ? "" : <BoutonAjouter texte="Créer un club" />} */}
        <div className="flex items-center gap-2 rounded-2xl px-4 py-5">
          {MembreEquipe ? (
            ""
          ) : (
            <InputBouton
              texte="Rejoindre un club"
              placeholder="Code Invitation"
            />
          )}
        </div>
      </div>
    </div>
  );
}
