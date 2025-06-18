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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { BoutonSupprimerTexte } from "@/components/Boutons/BoutonSupprimerTexte";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MembreEquipeWithUser } from "../hooks/useinfosclub";
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
    onQuitter();
  };
  return (
    <div className="overflow-x-auto mt-10">
      <Table>
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
              Rejoins le
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
              <TableRow key={m.id} className=" ">
                <TableCell className="p-4">
                  <Checkbox />
                </TableCell>
                <TableCell>
                  {m.user.image ? (
                    <Image
                      src={m.user.image}
                      width={40}
                      height={40}
                      alt={m.user.name}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700">
                      <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                        {m.user.name?.charAt(0).toUpperCase() || "?"}
                      </span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-black dark:text-white">
                  {m.user.name}
                </TableCell>

                <TableCell>
                  {peutModifier ? (
                    <div className="relative">
                      <Select
                        value={m.role}
                        onValueChange={(value) =>
                          onModifierRole(m.userId, value)
                        }
                        disabled={isPendingPoste}
                      >
                        <SelectTrigger className="w-[160px] border border-black text-black dark:border-white dark:text-white ">
                          <SelectValue placeholder="Choisir un poste" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Roles</SelectLabel>
                            <SelectItem value="JOUEUR">Joueur</SelectItem>
                            <SelectItem value="ENTRAINEUR">
                              Entraîneur
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      {isPendingRole && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <Badge
                      className={`text-md ${m.role === "ENTRAINEUR" ? "bg-emerald-500 text-white" : "bg-sky-500 text-white"}`}
                    >
                      {" "}
                      {m.role === "ENTRAINEUR" ? "Entraîneur" : "Joueur"}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {peutModifier ? (
                    <div className="relative">
                      {m.role === "ENTRAINEUR" ? (
                        <span className="text-black dark:text-white">
                          Sans poste
                        </span>
                      ) : (
                        <Select
                          value={m.poste || ""}
                          onValueChange={(value) =>
                            onModifierPoste(m.userId, value)
                          }
                          disabled={isPendingPoste}
                        >
                          <SelectTrigger className="w-[160px] border border-black text-black dark:border-white dark:text-white ">
                            <SelectValue
                              placeholder="Choisir un poste"
                              className="placeholder:text-yellow-500"
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Postes</SelectLabel>
                              <SelectItem value="GARDIEN">Gardien</SelectItem>
                              <SelectItem value="DEFENSEUR">
                                Défenseur
                              </SelectItem>
                              <SelectItem value="MILIEU">Milieu</SelectItem>
                              <SelectItem value="ATTAQUANT">
                                Attaquant
                              </SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  ) : (
                    <span className="text-black dark:text-white">
                      {m.poste || "Sans poste"}
                    </span>
                  )}
                </TableCell>

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
                <TableCell className="text-black dark:text-white">
                  {m.joinedAt
                    ? new Date(m.joinedAt)
                        .toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "numeric",
                          year: "numeric",
                        })
                        .toLowerCase()
                    : "N/A"}
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
