// (hooks)/UseEvenement-Equipe.ts
"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FiltreEvenements } from "../schemas/SchemaEvenementv2";
import { EvenementListeSuccessResponse } from "../types/EvenementsTypes";
import { getEvenementsEquipe } from "../actions/EvenementEquipe-Actions";


export function useEvenementsEquipe(equipeId: string, filtres: FiltreEvenements = { type: "TOUS", limit: 5, page: 1 }) {
  const queryClient = useQueryClient();
  
  // Invalider le cache lors de la navigation
  if (typeof window !== 'undefined') {
    // Vérifier si nous venons de naviguer vers cette page
    const isNewNavigation = sessionStorage.getItem('lastPath') !== window.location.pathname;
    if (isNewNavigation) {
      // Invalider les requêtes précédentes
      queryClient.invalidateQueries({ queryKey: ["evenements-equipe"] });
      // Mettre à jour le chemin actuel
      sessionStorage.setItem('lastPath', window.location.pathname);
    }
  }

  return useQuery<EvenementListeSuccessResponse, Error>({
    queryKey: ["evenements-equipe", equipeId, filtres],
    queryFn: async () => {
      const result = await getEvenementsEquipe(equipeId, filtres);
      
      if (!result.success) {
        throw new Error(result.message || "Erreur lors de la récupération des événements");
      }
      
      return {
        success: true,
        evenementsAVenir: result.evenementsAVenir || [],
        evenementsPassés: result.evenementsPassés || [],
        pagination: result.pagination || {
          total: 0,
          pages: 0,
          page: 1,
          limit: 20
        }
      };
    },
      enabled: !!equipeId,
    
    
  });
}