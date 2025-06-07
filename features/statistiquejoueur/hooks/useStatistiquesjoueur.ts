"use client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { StatistiquesJoueurResponse } from "../types/StatsJoueurTypes";

export function useStatistiqueJoueur(id: string) {
  return useQuery({
    queryKey: ["statistique-joueur-detail", id],
    queryFn: async () => {
      if (!id) return null;
      
      try {
        const { data } = await axios.get<StatistiquesJoueurResponse>(
          `/api/user/${id}/statistiques`
        );
        return data.statistiquesGlobales;
      } catch (error) {
        console.error("Erreur lors de la récupération des statistiques:", error);
        return null;
      }
    },
    enabled: !!id, 
  });
}


