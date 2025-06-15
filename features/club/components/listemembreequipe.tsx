"use client";
import React from "react";
import { useInfosClub } from "../hooks/useinfosclub";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import { useSupprimerJoueurClub } from "@/features/supprimerjoueurclub/hooks/useSupprimerJoueurClub";
import { BoutonSupprimer } from "@/components/Boutons/BoutonSupprimer";
import { Loader2 } from "lucide-react";
import { useModifierRoleClub } from "@/features/modifierrole/hook/useModifierRoleClub";


function Listemembreequipe() {
  const { data, isLoading } = useInfosClub();
  const { mutate: supprimer, isPending: isPendingSuppression } = useSupprimerJoueurClub();
  const { mutate: modifierRole, isPending: isPendingRole } = useModifierRoleClub();
  const { data: session } = authClient.useSession();
  const sessionId = session?.user.id;
  const estEntraineur = data?.role === "ENTRAINEUR";

  if (isLoading) return <p>Chargement...</p>;

  return (
    <div className="space-y-4">
      {data?.membres.map((m) => {
        const estUtilisateurActuel = m.userId === sessionId;
        const afficherSupprimer = estEntraineur && !estUtilisateurActuel && m.role !== "ENTRAINEUR";
        const peutModifierRole = estEntraineur && !estUtilisateurActuel;

        return (
          <div key={m.id} className="flex items-center gap-4 p-3 border rounded-lg">
            <Image
              className="rounded-full"
              src={m.user.image || "/default-avatar.png"}
              width={40}
              height={40}
              alt={m.user.name}
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{m.user.name}</p>
              <p className="text-sm text-gray-500 truncate">{m.user.email}</p>
            </div>
            <div className="flex items-center gap-2">
              {peutModifierRole ? (
                <div className="relative">
                  <select
                    value={m.role}
                    onChange={(e) => modifierRole({ id: m.userId, data: { role: e.target.value as "ENTRAINEUR" | "JOUEUR" } })}
                    disabled={isPendingRole}
                    className="block w-full p-2 text-sm border rounded-md shadow-sm focus:ring focus:ring-opacity-50"
                  >
                    <option value="JOUEUR">Joueur</option>
                    <option value="ENTRAINEUR">Entraîneur</option>
                  </select>
                  {isPendingRole && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  )}
                </div>
              ) : (
                <span className="px-3 py-1 text-sm bg-gray-100 rounded-full">
                  {m.role === "ENTRAINEUR" ? "Entraîneur" : "Joueur"}
                </span>
              )}
              
              <span className="px-3 py-1 text-sm bg-gray-100 rounded-full">
                {m.poste || "Sans poste"}
              </span>
              
              {afficherSupprimer && (
                <BoutonSupprimer 
                  supprimer={() => supprimer(m.id)} 
                  disabled={isPendingSuppression}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Listemembreequipe;