"use client";
import { BoutonCopier } from "@/components/Boutons/BoutonCopier";
import { BoutonSupprimer } from "@/components/Boutons/BoutonSupprimer";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CircleFadingPlus } from "lucide-react";
import React from "react";
import { useInfosClub } from "../hooks/useinfosclub";
import { useSupprimerCodeInvitation } from "@/features/codeinvitation/hooks/useSupprimerCodeInvitation";
import { useCreerouGenererCodeInvitation } from "@/features/codeinvitation/hooks/useCreerouGenererCodeInvitation";
import BoutonSupprimerClub from "./BoutonSupprimerClub";

function BlockEffectif() {
  const { data, isLoading } = useInfosClub();
  const { mutate, isPending } = useSupprimerCodeInvitation();
  const { mutate: MutationCreationCode, isPending: PendingCreationCode } =
    useCreerouGenererCodeInvitation();

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

  const entraineur = data?.role === "ENTRAINEUR";
  const code = data?.equipe.codeInvitation;

  return (
    <div className="md:flex-row gap-4 w-full flex flex-col">
      <div className="flex-1 border border-amber-300 rounded-lg shadow p-6 min-h-[140px]">
        <p>Salut </p>
      </div>
      <div className="flex-1 bg-white rounded-lg shadow p-6 min-h-[140px]">
        {/* Bloc 2 : Ajoute tes infos ici */}
      </div>
      <div className="flex-1 min-h-[200px] flex items-center justify-center">
        <div className="relative w-full max-w-md bg-white/70 backdrop-blur-md border border-amber-200 rounded-2xl shadow-xl p-8 flex flex-col items-center bg-gradient-to-br from-amber-50 via-white to-amber-100">
          {/* Titre */}
          <div className="mb-4 text-center">
            <div className="text-amber-600 font-bold text-lg tracking-wide uppercase drop-shadow">
              Code d'invitation du club
            </div>
            <div className="mt-2 text-xs text-amber-500">
              Partage ce code pour inviter un membre dans ton club
            </div>
          </div>
          {/* Code + boutons */}
          <div className="flex items-center gap-3 mb-4">
            {code && (
              <span className="font-mono text-2xl bg-amber-100/80 px-6 py-3 rounded-xl tracking-widest border border-amber-200 shadow-inner select-all transition-all duration-200">
                {code}
              </span>
            )}
            <BoutonCopier value={code} />
            {entraineur && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={CreerCodeInvitation}
                    disabled={PendingCreationCode}
                  >
                    <CircleFadingPlus className="w-5 h-5 text-amber-400" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Créer ou régénérer le code</p>
                </TooltipContent>
              </Tooltip>
            )}
            {entraineur && (
              <BoutonSupprimer
                supprimer={SupprimerCodeInvitation}
                disabled={isPending}
              />
            )}
          </div>
          {/* Message d'aide */}
          <div className="text-xs text-amber-400 mt-2">
            Ce code est confidentiel, ne le partage qu’aux personnes de
            confiance.
          </div>
        </div>
        {entraineur && (
          <BoutonSupprimerClub
            equipeid={data?.equipe.id || ""}
          ></BoutonSupprimerClub>
        )}

        

        <div></div>
      </div>
    </div>
  );
}

export default BlockEffectif;
