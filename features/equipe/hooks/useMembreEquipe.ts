import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { EquipeResponse } from "../types/equipetypes";

export function useMembreEquipe(id: string) {
  return useQuery({
    queryKey: ["membre-equipe", id],
    queryFn: async () => {
      try {
        const { data } = await axios.get<EquipeResponse>(`/api/equipes/${id}`);
        return data;
      } catch (error) {
        console.error("Erreur lors de la récupération des membres:", error);
        throw error;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
}