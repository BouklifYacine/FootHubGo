"use client";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MembreEquipeWithUser } from "../hooks/useinfosclub";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { LigneMembreEffectif } from "./LigneMembreEffectif";
import { DialogConfirmationSuppression } from "./DialogConfirmationSuppression";


interface TableauEffectifProps {
  membres: MembreEquipeWithUser[];
  estEntraineur: boolean;
  sessionId: string;
  onModifierRole: (userId: string, role: string) => void;
  onModifierPoste: (userId: string, poste: string) => void;
  onSupprimer: (membreId: string) => void;
  onQuitter: () => void;
  isPendingRole: boolean;
  isPendingPoste: boolean;
  isPendingSuppression: boolean;
  isPendingQuitter: boolean;
}

export function TableauEffectif({
  membres,
  estEntraineur,
  sessionId,
  onModifierRole,
  onModifierPoste,
  onSupprimer,
  onQuitter,
  isPendingRole,
  isPendingPoste,
  isPendingSuppression,
  isPendingQuitter,
}: TableauEffectifProps) {
  const [membreASupprimer, setMembreASupprimer] = useState<{
    id: string;
    nom: string;
  } | null>(null);

  const { data: session } = authClient.useSession();

  if (membres.length === 0) return <p>Pas de joueurs dans l&apos;effectif</p>;

  return (
    <>
      <div className="overflow-x-auto mt-10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="p-4"></TableHead>
              <TableHead className="text-black dark:text-white">Avatar</TableHead>
              <TableHead className="text-black dark:text-white">Nom</TableHead>
              <TableHead className="text-black dark:text-white">Rôle</TableHead>
              <TableHead className="text-black dark:text-white">Poste</TableHead>
              <TableHead className="text-black dark:text-white">Blessure</TableHead>
              <TableHead className="text-black dark:text-white">Licencié</TableHead>
              <TableHead className="text-black dark:text-white">Rejoins le</TableHead>
              <TableHead className="text-black dark:text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y">
            {membres.map((m) => (
              <LigneMembreEffectif
                key={m.id}
                membre={m}
                estUtilisateurActuel={session?.user.id === m.userId}
                estEntraineur={estEntraineur}
                onModifierRole={onModifierRole}
                onModifierPoste={onModifierPoste}
                onDemanderSuppression={(id, nom) => setMembreASupprimer({ id, nom })}
                onQuitter={onQuitter}
                isPendingRole={isPendingRole}
                isPendingPoste={isPendingPoste}
                isPendingSuppression={isPendingSuppression}
                isPendingQuitter={isPendingQuitter}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <DialogConfirmationSuppression
        membre={membreASupprimer}
        onConfirmer={() => {
          if (membreASupprimer) {
            onSupprimer(membreASupprimer.id);
            setMembreASupprimer(null);
          }
        }}
        onAnnuler={() => setMembreASupprimer(null)}
      />
    </>
  );
}
