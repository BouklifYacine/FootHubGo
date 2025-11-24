"use client";

import { BoutonCopier } from "@/components/Boutons/BoutonCopier";
import { BoutonSupprimer } from "@/components/Boutons/BoutonSupprimer";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CircleFadingPlus,
  MoreVertical,
  Pencil,
  Trash2,
  KeyRound,
} from "lucide-react";
import { useInfosClub } from "../hooks/useinfosclub";
import { useSupprimerCodeInvitation } from "@/features/codeinvitation/hooks/useSupprimerCodeInvitation";
import { useCreerouGenererCodeInvitation } from "@/features/codeinvitation/hooks/useCreerouGenererCodeInvitation";
import BoutonSupprimerClub from "./BoutonSupprimerClub";
import { BoutonModifierClub } from "@/features/modifierinfosclub/components/BoutonModifierClub";
import Image from "next/image";
import LogoCity from "@/public/Logo_Manchester_City_2016.svg";
import { Badge } from "@/components/ui/badge";
import { formatNiveauClub } from "@/lib/formatEnums";
import { BoutonDisabled } from "@/components/Boutons/BoutonDisabled";
import { useState } from "react";

function BlockEffectif() {
  const { data, isPending } = useInfosClub();
  const { mutate, isPending: DeleteInvitationCode } =
    useSupprimerCodeInvitation();
  const { mutate: MutationCreationCode, isPending: PendingCreationCode } =
    useCreerouGenererCodeInvitation();

  const [openCodeDialog, setOpenCodeDialog] = useState(false);
  const [openModifierDialog, setOpenModifierDialog] = useState(false);
  const [openSupprimerDialog, setOpenSupprimerDialog] = useState(false);

  const entraineur = data?.role === "ENTRAINEUR";
  const code = data?.equipe?.codeInvitation || "";
  const nombreMembres = data?.membres.length;

  const SupprimerCodeInvitation = () => {
    if (data?.equipe.id) {
      mutate(data?.equipe.id);
    }
  };

  const CreerCodeInvitation = () => {
    if (data?.equipe.id) {
      MutationCreationCode(data?.equipe.id);
    }
  };

  if (isPending) return <div>Chargement...</div>;

  return (
    <div className="flex flex-col items-center justify-center p-5">
      <div className="flex flex-col justify-center items-center mb-8 relative">
        {entraineur && (
          <div className="absolute top-0 right-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Actions du club</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => setOpenCodeDialog(true)}>
                  <KeyRound className="mr-2 h-4 w-4" />
                  <span>Gérer le code d&apos;invitation</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => setOpenModifierDialog(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  <span>Modifier le club</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => setOpenSupprimerDialog(true)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Supprimer le club</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        <Image
          className="rounded-full w-[100px] h-[100px] md:w-[140px] md:h-[140px] object-cover"
          alt="Logo du club"
          src={LogoCity}
        />

        <Badge className="w-auto px-3 py-1 mt-2 rounded-lg flex flex-col items-center">
          <p className="font-medium text-sm md:text-lg tracking-tighter">
            {data?.equipe?.nom}
          </p>
        </Badge>

        <div className="flex gap-10 mt-6">
          <div className="flex flex-col items-center">
            <p className="text-xl md:text-3xl font-bold">{nombreMembres}</p>
            <p className="text-sm md:text-lg tracking-tighter font-light">
              Membres
            </p>
          </div>

          <div className="flex flex-col items-center">
            <Badge className="rounded-xl text-xs md:text-sm px-3 py-1">
              {data?.equipe?.niveau ? formatNiveauClub(data.equipe.niveau) : ""}
            </Badge>
            <p className="text-sm md:text-lg tracking-tighter font-light mt-1">
              Niveau
            </p>
          </div>

          {code && (
            <div className="flex flex-col items-center">
              <p className="text-xl md:text-3xl font-bold font-mono">{code}</p>
              <p className="text-sm md:text-lg tracking-tighter font-light">
                Code
              </p>
            </div>
          )}
        </div>

        {data?.equipe?.description && (
          <div className="mt-4 text-center max-w-md">
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
              {data.equipe.description}
            </p>
          </div>
        )}
      </div>

      <Dialog open={openCodeDialog} onOpenChange={setOpenCodeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Code d&apos;invitation du club</DialogTitle>
            <DialogDescription>
              {code
                ? "Partage ce code pour inviter des membres dans ton club"
                : "Génère un code d'invitation pour agrandir ton club !"}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            {code && (
              <div className="flex items-center gap-2">
                <span className="font-mono text-2xl px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 flex-1 text-center">
                  {code}
                </span>
                <BoutonCopier value={code} />
              </div>
            )}

            <div className="flex gap-2 justify-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  {PendingCreationCode ? (
                    <BoutonDisabled
                      texte=""
                      classnameButton="w-full"
                      classnameLoader=""
                    />
                  ) : (
                    <Button
                      className="flex-1"
                      onClick={CreerCodeInvitation}
                      disabled={PendingCreationCode}
                    >
                      <CircleFadingPlus className="w-4 h-4 mr-2" />
                      {code ? "Changer le code" : "Créer un code"}
                    </Button>
                  )}
                </TooltipTrigger>
              </Tooltip>

              {code && (
                <BoutonSupprimer
                  supprimer={SupprimerCodeInvitation}
                  disabled={DeleteInvitationCode}
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BoutonModifierClub
        clubData={data}
        open={openModifierDialog}
        onOpenChange={setOpenModifierDialog}
        hideButton={true}
      />

      <BoutonSupprimerClub
        equipeid={data?.equipe?.id || ""}
        open={openSupprimerDialog}
        onOpenChange={setOpenSupprimerDialog}
        hideButton={true}
      />
    </div>
  );
}

export default BlockEffectif;
