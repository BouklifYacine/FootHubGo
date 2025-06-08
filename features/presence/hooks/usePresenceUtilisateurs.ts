import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Presence } from "../types/Presencetypes";

export const usePresencesUtilisateur = () => {
  return useQuery({
    queryKey: ["mes-presences"],
    queryFn: async () => {
      const { data } = await axios.get<Presence[]>("/api/mes-presences");
      console.log("Données récupérées:", data); // Log pour debug
      return data;
    },
    staleTime: 1000 * 60 * 5, 
  });
};