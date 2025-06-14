"use client";
import React from "react";
import { useInfosClub } from "../hooks/useinfosclub";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import { Trash2 } from "lucide-react";
import { useSupprimerJoueurClub } from "@/features/supprimerjoueurclub/hooks/useSupprimerJoueurClub";
import { BoutonSupprimer } from "@/components/Boutons/BoutonSupprimer";

function Listemembreequipe() {
  const { data, isLoading } = useInfosClub();
  const {mutate, isPending} = useSupprimerJoueurClub()
  const { data: session } = authClient.useSession();
  const sessionId = session?.user.id;
  const estEntraineur = data?.role === "ENTRAINEUR";

  if (isLoading) return <p>Ca charge</p>;

  return (
    <>
      {data?.membres.map((m) => {
        const estUtilisateurActuel = m.userId === sessionId;
        const afficherSupprimer = estEntraineur && !estUtilisateurActuel && m.role !== "ENTRAINEUR";

        return (
          <div key={m.id} className="flex gap-3 mt-4">
            <Image
              className="rounded-full"
              src={m.user.image || ""}
              width={30}
              height={30}
              alt={m.user.name}
            />
            <p>{m.user.name}</p>
            <p>{m.role}</p>
            <p>{m.poste == null ? "Sans poste" : "Gardien"}</p>
            <p>{m.isLicensed == false ? "Non" : ""}</p>
            <p>{m.user.email}</p>
            {afficherSupprimer && <BoutonSupprimer supprimer={() => mutate(m.id)} disabled={isPending}></BoutonSupprimer>}
          </div>
        );
      })}
    </>
  );
}

export default Listemembreequipe;
