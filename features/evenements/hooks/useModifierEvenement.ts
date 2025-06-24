import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import z from "zod";
import { ModifierEvenementAction } from "../actions/ModifierEvenementAction";
import { ModifierEvenementSchema } from "../schemas/ModificationEvenementsSchema";
import { EvenementsAPI, Evenements } from "../types/TypesEvenements";

type schema = z.infer<typeof ModifierEvenementSchema>;

export function useModifierEvenement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: schema }) => {
      const result = await ModifierEvenementAction(id, data);
      if (!result.success) throw new Error(result.message);
      return result;
    },

 
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["evenements"] });
      await queryClient.cancelQueries({ queryKey: ["evenements", id] });

      const previousEvenementsList = queryClient.getQueryData<EvenementsAPI>(["evenements"]);
      const previousEvenement = queryClient.getQueryData<Evenements>(["evenements", id]);

      if (previousEvenementsList) {
        const updatedEvenements = previousEvenementsList.evenements.map((evenement) => {
          if (evenement.id === id) {
            return {
              ...evenement,
              ...data,
              dateDebut: data.dateDebut instanceof Date ? data.dateDebut : new Date(data.dateDebut),
            };
          }
          return evenement;
        });

        queryClient.setQueryData<EvenementsAPI>(["evenements"], {
          ...previousEvenementsList,
          evenements: updatedEvenements,
        });
      }

      // 4. OPTIMISTIC UPDATE - Met à jour l'événement individuel
      if (previousEvenement) {
        queryClient.setQueryData<Evenements>(["evenements", id], {
          ...previousEvenement,
          ...data,
          dateDebut: data.dateDebut instanceof Date ? data.dateDebut : new Date(data.dateDebut),
        });
      }

      return { 
        previousEvenementsList, 
        previousEvenement,
        optimisticData: data 
      };
    },

  
    onSuccess: (resultat, { id, data }) => {
      // Affiche un feedback positif à l'utilisateur
      toast.success(resultat.message || "Événement modifié avec succès !");
      
      // Optionnel : Met à jour avec les données du serveur si différentes
      if (resultat.evenement) {
        queryClient.setQueryData(["evenements", id], resultat.evenement);
      }
    },


    onError: (erreur, { id }, contexte) => {
      if (contexte?.previousEvenementsList) {
        queryClient.setQueryData(["evenements"], contexte.previousEvenementsList);
      }
      if (contexte?.previousEvenement) {
        queryClient.setQueryData(["evenements", id], contexte.previousEvenement);
      }

      // Feedback d'erreur à l'utilisateur
      toast.error(erreur.message || "Erreur lors de la modification");
    },

   
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["evenements"] });
      queryClient.invalidateQueries({ queryKey: ["evenements", id] });
    },
  });
}
