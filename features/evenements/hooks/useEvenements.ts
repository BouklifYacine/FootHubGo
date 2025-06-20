
import { useQuery } from "@tanstack/react-query";
import { EvenementsAPI } from "../types/TypesEvenements";


export function useEvenements() {
  return useQuery<EvenementsAPI>({
    queryKey: ["evenements"],
    queryFn: async () => {
      const response = await fetch("/api/evenements");
      if (!response.ok) {
        console.log("Erreur call API ");
      }
      return response.json();
    },
  });
}
