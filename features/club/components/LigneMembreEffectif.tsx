import { TableCell, TableRow } from "@/components/ui/table";
import { MembreEquipeWithUser } from "../hooks/useinfosclub";

import { formatPosteJoueur } from "@/lib/formatEnums";
import { BoutonSupprimerTexte } from "@/components/Boutons/BoutonSupprimerTexte";
import { Trash2 } from "lucide-react";
import { AvatarMembre } from "./AvatarMembre";
import { BadgeRole } from "./BadgeRole";
import { BadgeStatut } from "./BadgeStatut";
import { ActionsMembreDropdown } from "./ActionMembreDropdown";

interface LigneMembreEffectifProps {
  membre: MembreEquipeWithUser;
  estUtilisateurActuel: boolean;
  estEntraineur: boolean;
  onModifierRole: (userId: string, role: string) => void;
  onModifierPoste: (userId: string, poste: string) => void;
  onDemanderSuppression: (id: string, nom: string) => void;
  onQuitter: () => void;
  isPendingRole: boolean;
  isPendingPoste: boolean;
  isPendingSuppression: boolean;
  isPendingQuitter: boolean;
}

export function LigneMembreEffectif({
  membre,
  estUtilisateurActuel,
  estEntraineur,
  onModifierRole,
  onModifierPoste,
  onDemanderSuppression,
  onQuitter,
  isPendingRole,
  isPendingPoste,
  isPendingSuppression,
  isPendingQuitter,
}: LigneMembreEffectifProps) {
  const peutModifier = estEntraineur && !estUtilisateurActuel;
  const estLicencie = membre.role === "ENTRAINEUR" ? true : membre.isLicensed;

  return (
    <TableRow>
      <TableCell className="p-4"></TableCell>
      <TableCell>
        <AvatarMembre image={membre.user.image} name={membre.user.name} />
      </TableCell>
      <TableCell className="text-black dark:text-white">
        {membre.user.name}
      </TableCell>
      <TableCell>
        <BadgeRole role={membre.role} />
      </TableCell>
      <TableCell className="text-black dark:text-white">
        {membre.poste ? formatPosteJoueur(membre.poste) : "Sans poste"}
      </TableCell>
      <TableCell>
        <BadgeStatut
          statut={!membre.isInjured}
          label={membre.isInjured ? "Oui" : "Non"}
          type="blessure"
        />
      </TableCell>
      <TableCell>
        <BadgeStatut
          statut={estLicencie}
          label={estLicencie ? "Oui" : "Non"}
          type="licence"
        />
      </TableCell>
      <TableCell className="text-black dark:text-white">
        {membre.joinedAt
          ? new Date(membre.joinedAt)
              .toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "numeric",
                year: "numeric",
              })
              .toLowerCase()
          : "N/A"}
      </TableCell>
      <TableCell>
        {estUtilisateurActuel ? (
          <BoutonSupprimerTexte
            onClick={onQuitter}
            disabled={isPendingQuitter}
            texte="Quitter Club"
            icon={
              <Trash2
                className="text-white"
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
            }
          />
        ) : peutModifier && membre.role !== "ENTRAINEUR" ? (
          <ActionsMembreDropdown
            membre={membre}
            onModifierRole={onModifierRole}
            onModifierPoste={onModifierPoste}
            onDemanderSuppression={onDemanderSuppression}
            isPending={isPendingRole || isPendingPoste || isPendingSuppression}
          />
        ) : null}
      </TableCell>
    </TableRow>
  );
}
