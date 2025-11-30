import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { MembreEquipeWithUser } from "../hooks/useinfosclub";
import { getFormattedPosteOptions } from "@/lib/formatEnums";

interface ActionsMembreDropdownProps {
  membre: MembreEquipeWithUser;
  onModifierRole: (userId: string, role: string) => void;
  onModifierPoste: (userId: string, poste: string) => void;
  onDemanderSuppression: (id: string, nom: string) => void;
  isPending: boolean;
}

export function ActionsMembreDropdown({
  membre,
  onModifierRole,
  onModifierPoste,
  onDemanderSuppression,
  isPending,
}: ActionsMembreDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
          <span className="sr-only">Ouvrir menu</span>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Pencil className="mr-2 h-4 w-4" />
            Modifier rôle
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onClick={() => onModifierRole(membre.userId, "JOUEUR")}
              >
                Joueur
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onModifierRole(membre.userId, "ENTRAINEUR")}
              >
                Entraîneur
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Pencil className="mr-2 h-4 w-4" />
            Modifier poste
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              {getFormattedPosteOptions().map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => onModifierPoste(membre.userId, option.value)}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="text-red-600 focus:text-red-600"
          onClick={() =>
            onDemanderSuppression(membre.id, membre.user.name)
          }
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Supprimer du club
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
