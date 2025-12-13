"use client";

import AvatarSimple from "@/components/Avatar/AvatarSimple";
import { useGetRequestToJoinClub } from "../hooks/UseGetRequestToJoinClubUser";
import LogoLiverpool from "@/public/england_arsenal.svg";
import { Loader2, SearchX, MoreVertical, Eye, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { formatNiveauClub, formatPosteJoueur } from "@/lib/formatEnums";
import { useDeleteRequestToAClub } from "../hooks/useDeleteRequestToAClub";
import DeleteRequestButton from "./DeleteRequestButton";
import ModifyRequestButton from "./ModifyRequestButton";

function RequestToJoinClubCard() {
  const { data: requests, isPending } = useGetRequestToJoinClub();
  const { mutate, isPending: PendingDeleteRequest } = useDeleteRequestToAClub();

  const DeleteRequest = (requestId: string, teamId: string) => {
    mutate({ requestId, teamId });
  };

  return (
    <>
      <div className="w-full max-w-3xl flex flex-col gap-6 mx-auto md:mx-0 px-4 md:px-0">
        <h1 className="font-bold text-2xl tracking-tight text-zinc-900 dark:text-zinc-50">
          Vos demandes de transfert
        </h1>

        {isPending ||
          (PendingDeleteRequest && (
            <div className="flex justify-start py-10">
              <Loader2 className="animate-spin text-zinc-400" />
            </div>
          ))}

        {!isPending && !requests && (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-zinc-50 dark:bg-zinc-900/50 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-center">
            <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-full mb-4">
              <SearchX className="h-8 w-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              Aucune candidature
            </h3>
            <p className="text-sm text-zinc-500 max-w-xs mt-2 leading-relaxed">
              Vous n'avez pas encore postulé dans un club.
            </p>
          </div>
        )}

        {requests?.map((req) => (
          <div
            key={req.id}
            className="group relative flex justify-between items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 ease-out hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="absolute inset-0 bg-zinc-900/5 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="scale-110 relative z-10">
                  <AvatarSimple
                    alt={"Logo Liverpool"}
                    src={LogoLiverpool.src}
                    Fallback={"LIV"}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <p className="font-bold tracking-tight text-xl text-zinc-900 dark:text-zinc-50 group-hover:text-primary transition-colors">
                  {req.equipe.nom}
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                    {formatNiveauClub(req.equipe.niveau)}
                  </span>
                  <span className="text-md text-zinc-500 font-medium">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Badge Statut */}
              <div
                className={`hidden sm:flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${
                  req.statut === "ATTENTE"
                    ? "bg-amber-50 text-amber-700 border-amber-200/60"
                    : req.statut === "ACCEPTEE"
                      ? "bg-green-50 text-green-700 border-green-200/60"
                      : "bg-red-50 text-red-700 border-red-200/60"
                }`}
              >
                {req.statut === "ATTENTE"
                  ? "En attente"
                  : req.statut === "ACCEPTEE"
                    ? "Acceptée"
                    : "Refusée"}
              </div>

              <Dialog>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 transition-colors">
                      <MoreVertical size={20} />
                    </div>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {/* 1. VOIR */}
                    <DialogTrigger asChild>
                      <DropdownMenuItem className="cursor-pointer gap-2 py-2.5">
                        <Eye size={16} className="text-zinc-500" />
                        <span className="font-medium">Voir la demande</span>
                      </DropdownMenuItem>
                    </DialogTrigger>

                    {/* Only show modify/delete for pending requests */}
                    {req.statut === "ATTENTE" && (
                      <>
                        <ModifyRequestButton
                          requestId={req.id}
                          teamId={req.equipeId}
                          currentPoste={req.poste}
                          currentNiveau={req.niveau}
                          currentMotivation={req.motivation}
                        />

                        <DropdownMenuSeparator />

                        <DeleteRequestButton
                          requestId={req.id}
                          equipeId={req.equipeId}
                          PendingDeleteRequest={PendingDeleteRequest}
                          DeleteRequest={DeleteRequest}
                        ></DeleteRequestButton>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-zinc-950 font-sans">
                  <div className="bg-zinc-50/50 dark:bg-zinc-900/50 p-8 flex flex-col items-center text-center border-b border-zinc-100 dark:border-zinc-800">
                    <div className="scale-150 mb-4 shadow-xl rounded-full border-4 border-white dark:border-zinc-900">
                      <AvatarSimple
                        alt={"Logo Club"}
                        src={LogoLiverpool.src}
                        Fallback={"CLB"}
                      />
                    </div>
                    <DialogTitle className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">
                      {req.equipe.nom}
                    </DialogTitle>
                    <p className="text-sm text-zinc-500 font-medium mt-1">
                      Dossier de candidature
                    </p>

                    <div
                      className={`mt-4 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${
                        req.statut === "ATTENTE"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-zinc-100 text-zinc-600 border-zinc-200"
                      }`}
                    >
                      {req.statut === "ATTENTE" ? "En attente" : req.statut}
                    </div>
                  </div>

                  <div className="p-8 space-y-8">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
                          Poste
                        </span>
                        <span className="font-bold text-base text-zinc-800 dark:text-zinc-100">
                          {formatPosteJoueur(req.poste)}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
                          Niveau
                        </span>
                        <span className="font-bold text-base text-zinc-800 dark:text-zinc-100">
                          {formatNiveauClub(req.niveau)}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
                          Date
                        </span>
                        <span className="font-bold text-base text-zinc-800 dark:text-zinc-100">
                          {new Date(req.createdAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    <Separator className="bg-zinc-100 dark:bg-zinc-800" />

                    <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-5 border border-zinc-100 dark:border-zinc-800">
                      <span className="text-[12px] uppercase tracking-wider text-zinc-400 font-bold mb-2 block">
                        Message au coach
                      </span>
                      <p className="text-sm text-zinc-600 dark:text-zinc-300 italic leading-relaxed font-medium">
                        "{req.motivation}"
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default RequestToJoinClubCard;
