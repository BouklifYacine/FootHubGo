"use client";
import React from "react";
import { useInfosClub } from "../hooks/useinfosclub";
import { authClient } from "@/lib/auth-client";
import { useSupprimerJoueurClub } from "@/features/supprimerjoueurclub/hooks/useSupprimerJoueurClub";
import { useModifierRoleClub } from "@/features/modifierrole/hook/useModifierRoleClub";
import { useQuitterClub } from "@/features/quitterclub/hook/useQuitterClub";
import { TableauEffectif } from "./Tableaueffectif";
import { useModifierPosteClub } from "@/features/modifierposte/hook/useModifierPoste";

function Listemembreequipe() {
  const { data, isLoading } = useInfosClub();
  const { mutate: supprimer, isPending: isPendingSuppression } = useSupprimerJoueurClub();
  const { mutate: modifierRole, isPending: isPendingRole } = useModifierRoleClub();
  const { mutate: modifierPoste, isPending: isPendingPoste } = useModifierPosteClub();
  const { mutate: quitterClub, isPending: isPendingQuitterClub } = useQuitterClub();
  const { data: session } = authClient.useSession();
  const sessionId = session?.user.id;
  const estEntraineur = data?.role === "ENTRAINEUR";

  if (isLoading) return <p>Chargement...</p>;
  if (!data) return <p>Aucune donnée disponible</p>;

  return (
    <TableauEffectif
      membres={data.membres}
      estEntraineur={estEntraineur}
      sessionId={sessionId || ""}
      onModifierRole={(userId : string, role ) => 
        modifierRole({ id: userId, data: { role: role as "ENTRAINEUR" | "JOUEUR" } })
      }
      onModifierPoste={(userId : string, poste) => 
        modifierPoste({ id: userId, data: { poste: poste as "GARDIEN" | "DEFENSEUR" | "MILIEU" | "ATTAQUANT" } })
      }
      onSupprimer={(membreId : string) => supprimer(membreId)}
      onQuitter={quitterClub}
      isPendingRole={isPendingRole}
      isPendingPoste={isPendingPoste}
      isPendingSuppression={isPendingSuppression}
      isPendingQuitter={isPendingQuitterClub}
    />
  );
}

export default Listemembreequipe;