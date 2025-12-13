"use client";

import AvatarSimple from "@/components/Avatar/AvatarSimple";
import { useGetTeamApplications } from "../hooks/useGetTeamApplications";
import { Loader2, SearchX, Clock, CheckCircle, XCircle } from "lucide-react";
import { formatNiveauClub, formatPosteJoueur } from "@/lib/formatEnums";
import ReviewApplicationButtons from "./ReviewApplicationButtons";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

type Props = {
  teamId: string;
};

function CoachApplicationsCard({ teamId }: Props) {
  const { data: applications, isPending } = useGetTeamApplications(teamId);

  const pendingApplications = applications?.filter(
    (app) => app.statut === "ATTENTE"
  );

  return (
    <div className="w-full max-w-3xl flex flex-col gap-6 mx-auto md:mx-0 px-4 md:px-0">
      <h1 className="font-bold text-2xl tracking-tight text-zinc-900 dark:text-zinc-50">
        Candidatures reçues
      </h1>

      {isPending && (
        <div className="flex justify-start py-10">
          <Loader2 className="animate-spin text-zinc-400" />
        </div>
      )}

      {!isPending && (!applications || applications.length === 0) && (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-zinc-50 dark:bg-zinc-900/50 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-center">
          <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-full mb-4">
            <SearchX className="h-8 w-8 text-zinc-400" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            Aucune candidature
          </h3>
          <p className="text-sm text-zinc-500 max-w-xs mt-2 leading-relaxed">
            Vous n'avez reçu aucune demande d'adhésion pour le moment.
          </p>
        </div>
      )}

      {pendingApplications && pendingApplications.length > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            {pendingApplications.length} demande(s) en attente
          </span>
        </div>
      )}

      {applications?.map((app) => {
        const isPending = app.statut === "ATTENTE";
        const isAccepted = app.statut === "ACCEPTEE";

        return (
          <div
            key={app.id}
            className={`group relative flex justify-between items-center bg-white dark:bg-zinc-900 border rounded-2xl p-5 shadow-sm transition-all duration-300 ease-out ${
              isPending
                ? "border-amber-200 dark:border-amber-800/50 hover:border-amber-300 hover:-translate-y-0.5 hover:shadow-md"
                : "border-zinc-200 dark:border-zinc-800 opacity-70"
            }`}
          >
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="absolute inset-0 bg-zinc-900/5 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="scale-110 relative z-10">
                  <AvatarSimple
                    alt={app.user.name}
                    src={app.user.image || ""}
                    Fallback={app.user.name.substring(0, 2).toUpperCase()}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <p className="font-bold tracking-tight text-xl text-zinc-900 dark:text-zinc-50 group-hover:text-primary transition-colors">
                  {app.user.name}
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                    {formatPosteJoueur(app.poste)}
                  </span>
                  <span className="text-xs font-medium text-zinc-400">
                    Niveau: {formatNiveauClub(app.niveau)}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Status Badge */}
              <div
                className={`hidden sm:flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${
                  isPending
                    ? "bg-amber-50 text-amber-700 border-amber-200/60"
                    : isAccepted
                      ? "bg-green-50 text-green-700 border-green-200/60"
                      : "bg-red-50 text-red-700 border-red-200/60"
                }`}
              >
                {isPending && <Clock className="h-3 w-3 mr-1" />}
                {isAccepted && <CheckCircle className="h-3 w-3 mr-1" />}
                {!isPending && !isAccepted && (
                  <XCircle className="h-3 w-3 mr-1" />
                )}
                {isPending ? "En attente" : isAccepted ? "Acceptée" : "Refusée"}
              </div>

              {isPending && (
                <>
                  {/* View Details Dialog */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-xs">
                        Voir
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-zinc-950 font-sans">
                      <div className="bg-zinc-50/50 dark:bg-zinc-900/50 p-8 flex flex-col items-center text-center border-b border-zinc-100 dark:border-zinc-800">
                        <div className="scale-150 mb-4 shadow-xl rounded-full border-4 border-white dark:border-zinc-900">
                          <AvatarSimple
                            alt={app.user.name}
                            src={app.user.image || ""}
                            Fallback={app.user.name
                              .substring(0, 2)
                              .toUpperCase()}
                          />
                        </div>
                        <DialogTitle className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">
                          {app.user.name}
                        </DialogTitle>
                        <p className="text-sm text-zinc-500 font-medium mt-1">
                          Demande d'adhésion
                        </p>
                      </div>

                      <div className="p-8 space-y-8">
                        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
                              Poste
                            </span>
                            <span className="font-bold text-base text-zinc-800 dark:text-zinc-100">
                              {formatPosteJoueur(app.poste)}
                            </span>
                          </div>

                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
                              Niveau
                            </span>
                            <span className="font-bold text-base text-zinc-800 dark:text-zinc-100">
                              {formatNiveauClub(app.niveau)}
                            </span>
                          </div>

                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
                              Date
                            </span>
                            <span className="font-bold text-base text-zinc-800 dark:text-zinc-100">
                              {new Date(app.createdAt).toLocaleDateString(
                                "fr-FR",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        </div>

                        <Separator className="bg-zinc-100 dark:bg-zinc-800" />

                        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-5 border border-zinc-100 dark:border-zinc-800">
                          <span className="text-[12px] uppercase tracking-wider text-zinc-400 font-bold mb-2 block">
                            Motivation
                          </span>
                          <p className="text-sm text-zinc-600 dark:text-zinc-300 italic leading-relaxed font-medium">
                            "{app.motivation}"
                          </p>
                        </div>

                        <div className="flex justify-center gap-4 pt-4">
                          <ReviewApplicationButtons
                            requestId={app.id}
                            teamId={teamId}
                          />
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Accept/Reject Buttons */}
                  <ReviewApplicationButtons
                    requestId={app.id}
                    teamId={teamId}
                  />
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default CoachApplicationsCard;
