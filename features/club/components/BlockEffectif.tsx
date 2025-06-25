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
import { BoutonModifierClub } from "@/features/modifierinfosclub/components/BoutonModifierClub";
import Image from "next/image";
import GithubImage from "@/public/github-icon-2.svg";
import { Badge } from "@/components/ui/badge";
import { BoutonDisabled } from "@/components/Boutons/BoutonDisabled";

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
    <div className="flex justify-between items-center flex-col md:flex-row gap-4 p-5">
      <div className="border border-blue-300 rounded-xl p-4 w-full md:w-xl flex flex-col   ">
        <div className="flex flex-col ">
          <Image
            src={GithubImage}
            alt="photo profil"
            width={40}
            height={30}
            className="mb-2.5"
          ></Image>
          <p className="md:text-4xl text-2xl font-bold tracking-tight">
            {" "}
            {data?.equipe.nom}{" "}
          </p>
          <p className="md:text-xl">
            {" "}
            Niveau : <Badge>{data?.equipe.niveau.toLowerCase()}</Badge>{" "}
          </p>
          {data?.equipe.description && (
            <p className="text-black dark:text-gray-300 text-xs mt-2">
              {" "}
              Description : <br></br>
              {data?.equipe.description}{" "}
            </p>
          )}
        </div>

        <div className=" flex justify-end gap-2">
          {data?.role === "ENTRAINEUR" && <BoutonModifierClub />}
          {entraineur && (
            <BoutonSupprimerClub
              equipeid={data?.equipe.id || ""}
            ></BoutonSupprimerClub>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center">
        <div className="relative w-full max-w-md bg-blue/70 backdrop-blur-md border border-blue-300 rounded-2xl shadow-xl p-8 flex flex-col items-center ">
          {/* Titre */}
          <div className="mb-4 text-center">
            <div className="text-blue-600 font-bold text-xl tracking-wide uppercase drop-shadow">
              Code d&apos;invitation du club
            </div>
            {code ? (
              <div className="mt-2 text-xs text-blue-500">
                Partage ce code pour inviter un membre dans ton club
              </div>
            ) : (
              <div className="mt-2 text-xs text-blue-500">
                Génère ton code d&apos;invitation pour aggrandir ton club !
              </div>
            )}
          </div>
          {/* Code + boutons */}
          <div className="flex items-center gap-3 mb-4">
            {code && (
              <span className="font-mono text-2xl  px-6 py-3 rounded-xl tracking-widest border border-blue-200  ">
                {code}
              </span>
            )}
            {code && <BoutonCopier value={code} />}
            {entraineur && (
              <Tooltip>
                <TooltipTrigger asChild>
                  {PendingCreationCode ? (
                    <BoutonDisabled
                      texte=""
                      classnameButton=""
                      classnameLoader=""
                    ></BoutonDisabled>
                  ) : (
                    <Button
                      className="cursor-pointer dark:bg-black bg-white border-gray-200 border hover:bg-white dark:border-gray-800"
                      onClick={CreerCodeInvitation}
                      disabled={PendingCreationCode}
                    >
                      <CircleFadingPlus className="w-5 h-5 text-blue-600 dark:text-white" />
                    </Button>
                  )}
                </TooltipTrigger>
                <TooltipContent>
                  <p>Créer ou régénérer le code</p>
                </TooltipContent>
              </Tooltip>
            )}
            {entraineur && code && (
              <BoutonSupprimer
                supprimer={SupprimerCodeInvitation}
                disabled={isPending}
              />
            )}
          </div>
          {/* Message d'aide */}
          {code && (
            <div className="text-xs text-blue-600 mt-2">
              Ce code est confidentiel, ne le partage qu’aux personnes de
              confiance.
            </div>
          )}
        </div>

        <div></div>
      </div>
    </div>
  );
}

export default BlockEffectif;
