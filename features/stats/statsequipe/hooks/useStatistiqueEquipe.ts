import { useQuery } from "@tanstack/react-query";
import { StatistiqueEquipeID } from "../interface/InterfaceStatsEquipe";

export function UseStatistiqueEquipeID(id: string | undefined) {
  return useQuery<StatistiqueEquipeID>({
    queryKey: ["statistiqueequipe", id],
    queryFn: async () => {
      const res = await fetch(`/api/statistiques/equipes/${id}`);
      if (!res.ok) {
        throw new Error(await res.text());
      }
      return res.json() as Promise<StatistiqueEquipeID>;
    },
    enabled: !!id, 
  });
}