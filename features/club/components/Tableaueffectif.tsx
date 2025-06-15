// components/TableauEffectif.tsx
"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";
import Image from "next/image";
import { CircleCheck, CircleX, Loader2 } from "lucide-react";
import { BoutonSupprimer } from "@/components/Boutons/BoutonSupprimer";
import { MembreEquipe, User } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { BoutonSupprimerTexte } from "@/components/Boutons/BoutonSupprimerTexte";

// types/membre.d.ts
export type MembreEquipeWithUser = MembreEquipe & {
  user: Pick<User, "name" | "image" | "email">;
};

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

    const QuitterClub = () => {
        onQuitter()
    }
  return (
    <div className="overflow-x-auto mt-10">
      <Table >
        <TableHead>
          <TableRow>
            <TableHeadCell className="p-4">
              <Checkbox />
            </TableHeadCell>
            <TableHeadCell className="text-black dark:text-white">
              Avatar
            </TableHeadCell>
            <TableHeadCell className="text-black dark:text-white">
              Nom
            </TableHeadCell>

            <TableHeadCell className="text-black dark:text-white">
              Rôle
            </TableHeadCell>
            <TableHeadCell className="text-black dark:text-white">
              Poste
            </TableHeadCell>
            <TableHeadCell className="text-black dark:text-white">
              Licencié
            </TableHeadCell>
            <TableHeadCell className="text-black dark:text-white">
              Actions
            </TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody className="divide-y">
          {membres.map((m) => {
            const estUtilisateurActuel = m.userId === sessionId;
            const afficherSupprimer =
              estEntraineur && !estUtilisateurActuel && m.role !== "ENTRAINEUR";
            const peutModifier = estEntraineur && !estUtilisateurActuel;

            return (
              <TableRow
                key={m.id}
                className="bg-white dark:border-gray-700 dark:bg-gray-800"
              >
                <TableCell className="p-4">
                  <Checkbox />
                </TableCell>
                <TableCell>
                  <Image
                    src={m.user.image || "/default-avatar.png"}
                    width={40}
                    height={40}
                    alt={m.user.name}
                    className="rounded-full"
                  />
                </TableCell>
                <TableCell className="text-black dark:text-white">
                  {m.user.name}
                </TableCell>

                <TableCell>
                  {peutModifier ? (
                    <div className="relative">
                      <select
                        value={m.role}
                        onChange={(e) =>
                          onModifierRole(m.userId, e.target.value)
                        }
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
                    <Badge className={`${m.role === "ENTRAINEUR"? "bg-emerald-500 text-white" : "bg-sky-500 text-white"}`}>
                      {" "}
                      {m.role === "ENTRAINEUR" ? "Entraîneur" : "Joueur"}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {peutModifier ? (
                    <div className="relative">
                      <select
                        value={m.poste || ""}
                        onChange={(e) =>
                          onModifierPoste(m.userId, e.target.value)
                        }
                        disabled={isPendingPoste}
                        className="block w-full p-2 text-sm border rounded-md shadow-sm focus:ring focus:ring-opacity-50"
                      >
                        <option value="GARDIEN">Gardien</option>
                        <option value="DEFENSEUR">Défenseur</option>
                        <option value="MILIEU">Milieu</option>
                        <option value="ATTAQUANT">Attaquant</option>
                      </select>
                      {isPendingPoste && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-black dark:text-white">
                      {m.poste || "Sans poste"}
                    </span>
                  )}
                </TableCell>
                {/* border-red-800 bg-red-200 text-red-800 */}

                <TableCell>
                  {" "}
                  <Badge
                    className={`rounded-md border text-md  ${m.isLicensed ? "border-emerald-800 bg-emerald-100 text-emerald-800" : "border-red-800 bg-red-200 text-red-800 "}`}
                  >
                    {" "}
                    {m.isLicensed ? (
                      <CircleCheck size={16} className="mr-1" />
                    ) : (
                      <CircleX size={16} className="mr-1" />
                    )}{" "}
                    {m.isLicensed ? "Oui" : "Non"}{" "}
                  </Badge>
                </TableCell>
                <TableCell>
                  {afficherSupprimer && (
                    <BoutonSupprimer
                      supprimer={() => onSupprimer(m.id)}
                      disabled={isPendingSuppression}
                    />
                  )}
                  {estUtilisateurActuel && (
                    <BoutonSupprimerTexte
                      onClick={QuitterClub}
                      disabled={isPendingQuitter}
                      texte="Quitter Club"
                      
                    />
                      
                  
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
