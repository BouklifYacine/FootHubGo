import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { StatistiqueEquipeAgrege, StatistiqueEquipeReponse } from "../types/statistiquesequipetypes";

export function useStatistiqueEquipeFDP(id: string) {
  return useQuery<StatistiqueEquipeAgrege>({
    queryKey: ["statistique-equipe", id],
    queryFn: async () => {
      const { data } = await axios.get<StatistiqueEquipeReponse>(
        `/api/user/${id}/statistiquesteam`
      );
      return data.StatistiqueEquipe;
    },
    enabled: !!id,
  });
}