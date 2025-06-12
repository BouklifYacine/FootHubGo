"use client";
import { BoutonCopier } from "@/components/Boutons/BoutonCopier";
import { BoutonSupprimer } from "@/components/Boutons/BoutonSupprimer";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MembreEquipe, Equipe } from "@prisma/client";
import { CircleFadingPlus } from "lucide-react";
import React from "react";
import { useInfosClub } from "../hooks/useinfosclub";

interface BlockEffectifProps {
  infosequipe: (MembreEquipe & { equipe: Equipe }) | undefined;
}

function BlockEffectif({ infosequipe }: BlockEffectifProps) {
    const {data, isLoading} = useInfosClub()
  console.log( data?.equipe.codeInvitation);
  const code = data?.equipe.codeInvitation || "Aucun code";
  return (
    <div className="md:flex-row gap-4 w-full flex flex-col">
      <div className="flex-1 border border-amber-300 rounded-lg shadow p-6 min-h-[140px]">
        <p>Salut </p>
      </div>
      <div className="flex-1 bg-white rounded-lg shadow p-6 min-h-[140px]">
        {/* Bloc 2 : Ajoute tes infos ici */}
      </div>
      <div className="flex-1 border border-amber-300 rounded-lg shadow p-6 min-h-[140px]">
        {/* Bloc 3 : Ajoute tes infos ici */}

        <div className="flex flex-col gap-1 justify-center items-center ">
          <p className="text-xl font-bold tracking-tight">
            Code d'invitation du club :
          </p>
          <div className="flex gap-2">
            <p>{infosequipe?.equipe.codeInvitation}</p>
          </div>
        </div>
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
            <span className="font-mono text-2xl bg-amber-100/80 px-6 py-3 rounded-xl tracking-widest border border-amber-200 shadow-inner select-all transition-all duration-200">
              {code}
            </span>
            <BoutonCopier value={code} />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="hover:bg-amber-100"
                  aria-label="Créer ou régénérer le code"
                >
                  <CircleFadingPlus className="w-5 h-5 text-amber-400" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Créer ou régénérer le code</p>
              </TooltipContent>
            </Tooltip>
            <BoutonSupprimer />
          </div>
          {/* Message d'aide */}
          <div className="text-xs text-amber-400 mt-2">
            Ce code est confidentiel, ne le partage qu’aux personnes de confiance.
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlockEffectif;
