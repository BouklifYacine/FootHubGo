"use client";

import { BadgeTexteIcone } from "@/components/Badge/BadgeTexteIcone";
import { Button } from "@/components/ui/button";
import Liverpool from "@/public/action-de-footballeur-sur-le-stade.jpg";
import {
  Calendar,
  CircleCheck,
  CircleX,
  Clock,
  MapPin,
  UsersRound,
  Loader2,
  Ban,
} from "lucide-react";
import { useGetCallUp } from "../hooks/UseGetCallUp";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { useCallUpResponseByPlayer } from "../hooks/UseCallUpResponseByPlayer";
import { useState } from "react";

dayjs.locale("fr");

function CallUpCard() {
  const { data, isPending } = useGetCallUp();
  const { mutate, isPending: isPendingCallUpResponse } = useCallUpResponseByPlayer();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleAccept = (callUpId: string) => {
    setLoadingAction(callUpId);
    mutate({ callUpId, statut: "CONFIRME" });
  };

  const handleRefuse = (callUpId: string) => {
    setLoadingAction(callUpId);
    mutate({ callUpId, statut: "REFUSE" });
  };

  if (isPending) {
    return (
      <div className="bg-white rounded-xl w-full max-w-[425px] mt-4 animate-pulse">
        <div className="h-48 bg-gray-200 rounded-t-xl" />
        <div className="p-4 space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-10 bg-gray-200 rounded w-full mt-6" />
        </div>
      </div>
    );
  }

  if (!data || !data.convocations || data.convocations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl w-full max-w-[425px] mt-4">
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-xl font-bold text-gray-700 mb-2">
          Aucune convocation
        </h3>
        <p className="text-gray-500">
          Vous n&apos;avez pas de convocation en attente pour le moment
        </p>
      </div>
    );
  }

  return (
    <>
      {data.convocations.map((convocation) => {
        const date = dayjs(convocation.evenement.dateDebut).format("dddd D MMMM");
        const heure = dayjs(convocation.evenement.dateDebut).format("HH:mm");
        const eventDate = dayjs(convocation.evenement.dateDebut);
        const now = dayjs();
        const hoursUntilEvent = eventDate.diff(now, "hour", true);
        
        const isExpired = convocation.statut === "EN_ATTENTE" && hoursUntilEvent < 3;
        const isUrgent = hoursUntilEvent < 24 && hoursUntilEvent >= 3;

        return (
          <div key={convocation.id} className="bg-white rounded-xl w-full max-w-[425px] mt-4 shadow-sm">
            <div
              className="rounded-t-lg"
              style={{
                backgroundImage: `url(${Liverpool.src})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              {/* ✅ Header avec badges */}
              <div className="flex justify-between items-start p-2">
                <BadgeTexteIcone
                  texte={convocation.evenement.typeEvenement}
                  classname="tracking-tighter"
                />
                
                {/* ✅ Badge de statut */}
                {(convocation.statut !== "EN_ATTENTE" || isExpired) && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      convocation.statut === "CONFIRME"
                        ? "bg-green-100 text-green-700"
                        : convocation.statut === "REFUSE"
                        ? "bg-red-100 text-red-700"
                        : isExpired
                        ? "bg-gray-100 text-gray-700"
                        : ""
                    }`}
                  >
                    {convocation.statut === "CONFIRME" 
                      ? "✓ Confirmé" 
                      : convocation.statut === "REFUSE"
                      ? "✗ Refusé"
                      : isExpired
                      ? "⏱ Expiré"
                      : ""
                    }
                  </span>
                )}
              </div>

              <div className="flex p-2">
                <p className="text-2xl tracking-tighter text-white font-bold">
                  {convocation.evenement.titre}
                </p>
              </div>
            </div>

            {/* ✅ Alerte urgence */}
            {isUrgent && convocation.statut === "EN_ATTENTE" && (
              <div className="mx-4 mt-4 p-2 bg-orange-100 border-l-4 border-orange-500 text-orange-700 text-sm rounded">
                ⚠️ Réponse urgente : événement dans moins de 24h
              </div>
            )}

            {/* ✅ Alerte expiration */}
            {isExpired && (
              <div className="mx-4 mt-4 p-2 bg-gray-100 border-l-4 border-gray-500 text-gray-700 text-sm rounded">
                ⏱ Délai expiré : vous devez répondre au moins 3h avant l&apos;événement
              </div>
            )}

            <div className="p-2 mt-4 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="bg-blue-500 rounded-full w-9 h-9 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <p className="text-black">{date}</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-blue-500 rounded-full w-9 h-9 flex items-center justify-center">
                  <UsersRound className="w-6 h-6 text-white" />
                </div>
                <p className="text-black">{convocation.evenement.adversaire}</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-blue-500 rounded-full w-9 h-9 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <p className="text-black">{heure}</p>
              </div>

              {convocation.evenement.lieu && (
                <div className="flex items-center gap-2">
                  <div className="bg-blue-500 rounded-full w-9 h-9 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-black">{convocation.evenement.lieu}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 p-4">
              {/* ✅ Afficher les boutons selon le statut */}
              {convocation.statut === "EN_ATTENTE" && !isExpired && (
                <>
                  <Button
                    onClick={() => handleRefuse(convocation.id)}
                    disabled={isPendingCallUpResponse}
                    aria-label="Refuser la convocation"
                    className="w-47 bg-red-500 hover:bg-red-600 active:scale-95 transition-all text-white tracking-tight font-bold cursor-pointer disabled:opacity-50"
                  >
                    {isPendingCallUpResponse && loadingAction === convocation.id ? (
                      <Loader2 className="animate-spin" aria-hidden="true" />
                    ) : (
                      <CircleX aria-hidden="true" />
                    )}
                    {isPendingCallUpResponse && loadingAction === convocation.id ? "Envoi..." : "Refuser"}
                  </Button>

                  <Button
                    onClick={() => handleAccept(convocation.id)}
                    disabled={isPendingCallUpResponse}
                    aria-label="Accepter la convocation"
                    className="w-47 bg-green-500 hover:bg-green-600 active:scale-95 transition-all text-white tracking-tight font-bold cursor-pointer disabled:opacity-50"
                  >
                    {isPendingCallUpResponse && loadingAction === convocation.id ? (
                      <Loader2 className="animate-spin" aria-hidden="true" />
                    ) : (
                      <CircleCheck aria-hidden="true" />
                    )}
                    {isPendingCallUpResponse && loadingAction === convocation.id ? "Envoi..." : "Accepter"}
                  </Button>
                </>
              )}

              {/* ✅ État expiré */}
              {isExpired && (
                <div className="w-full space-y-2">
                  <Button
                    disabled
                    className="w-full bg-gray-400 text-white tracking-tight font-bold opacity-75"
                  >
                    <Ban aria-hidden="true" /> Délai de réponse expiré
                  </Button>
                  <p className="text-xs text-gray-500 text-center">
                    Vous deviez répondre au moins 3h avant l&apos;événement
                  </p>
                </div>
              )}

              {/* ✅ État confirmé avec date */}
              {convocation.statut === "CONFIRME" && (
                <div className="w-full space-y-2">
                  <Button
                    disabled
                    className="w-full bg-green-500 text-white tracking-tight font-bold opacity-75"
                  >
                    <CircleCheck aria-hidden="true" /> Présence confirmée
                  </Button>
                  {convocation.dateReponse && (
                    <p className="text-xs text-gray-500 text-center">
                      Confirmé le {dayjs(convocation.dateReponse).format("DD/MM à HH:mm")}
                    </p>
                  )}
                </div>
              )}

              {/* ✅ État refusé avec date */}
              {convocation.statut === "REFUSE" && (
                <div className="w-full space-y-2">
                  <Button
                    disabled
                    className="w-full bg-red-500 text-white tracking-tight font-bold opacity-75"
                  >
                    <CircleX aria-hidden="true" /> Absence confirmée
                  </Button>
                  {convocation.dateReponse && (
                    <p className="text-xs text-gray-500 text-center">
                      Refusé le {dayjs(convocation.dateReponse).format("DD/MM à HH:mm")}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}

export default CallUpCard;
