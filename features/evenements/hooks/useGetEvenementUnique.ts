import { useQuery } from "@tanstack/react-query";
import { EvenementComplet } from "../types/TypesEvenements";

export function useGetEvenementUnique(id: string) {
  return useQuery<EvenementComplet>({
    queryKey: ["evenements", id],
    queryFn: async () => {
      const response = await fetch(`/api/evenements/${id}`);
      if (!response.ok) {
        console.log("Erreur call API ");
      }
      return response.json();
    },
  });
}

export function useGetEvenementStatistiqueUnique(id: string) {
  return useQuery<EvenementComplet>({
    queryKey: ["statistique", id],
    queryFn: async () => {
      const response = await fetch(`/api/evenements/${id}`);
      if (!response.ok) {
        console.log("Erreur call API ");
      }
      return response.json();
    },
  });
}
