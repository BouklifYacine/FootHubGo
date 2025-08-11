import { useQuery } from "@tanstack/react-query";
import { StatistiqueJoueur } from "../interface-types/interfacetype";

export function UseStatistiqueJoueur() {
  return useQuery<StatistiqueJoueur>({
    queryKey: ["statistiquejoueur"],
    queryFn: async () => {
      const res = await fetch("/api/statistiques/joueurs");
      if (!res.ok) {
        throw new Error(await res.text());
      }
      return res.json() as Promise<StatistiqueJoueur>;
    },
  });
}