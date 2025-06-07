"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useState } from "react";
import { creerEvenement } from "../actions/CreerEvenement-Action";
import { ConflitDetail, Evenement, EvenementCreationErrorResponse, EvenementCreationResponse, EvenementCreationSuccessResponse } from "../types/EvenementsTypes";



export function useCreerEvenement(equipeId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [conflits, setConflits] = useState<ConflitDetail[]>([]);
  const [conflitsModalOpen, setConflitsModalOpen] = useState(false);

  const mutation = useMutation<EvenementCreationResponse, Error, Evenement>({
    mutationFn: async (donnees: Evenement) => {
      return await creerEvenement(donnees, equipeId);
    },

    // onMutate: (variables) => {
    //   if (variables.recurrent === true) {
    //     toast.loading("Création des événements récurrents en cours...");
    //   } else {
    //     toast.loading("Création de l'événement en cours...");
    //   }
    // },

    onSuccess: (result) => {
      toast.dismiss();

      if (result.success) {
        const successResult = result as EvenementCreationSuccessResponse;
        if (successResult.nombreEvenements && successResult.nombreEvenements > 1) {
          toast.success(`${successResult.nombreEvenements} événements créés avec succès`);
        } else {
          toast.success(result.message);
        }
        
        queryClient.invalidateQueries({ 
          queryKey: ["evenements-equipe", equipeId] 
        });
        
        router.push(`/dashboardclient/evenements/${equipeId}`);
      } else {
        const errorResult = result as EvenementCreationErrorResponse;
        
        if (errorResult.conflits && errorResult.conflits.length > 0) {
          setConflits(errorResult.conflits);
          setConflitsModalOpen(true);
        } else {
          toast.error(errorResult.message || "Échec de la création de l'événement");
        }

        if (errorResult.details) {
          console.error("Détails des erreurs:", errorResult.details);
        }
      }
    },

    onError: (error: Error) => {
      toast.dismiss();
      toast.error(
        error.message ||
          "Une erreur est survenue lors de la création de l'événement"
      );
    },
  });

  return {
    mutate: mutation.mutate,
    isPending: mutation.isPending,
    conflits,
    conflitsModalOpen,
    setConflitsModalOpen,
    resetConflits: () => setConflits([])
  };
}