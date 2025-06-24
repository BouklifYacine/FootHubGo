
import { useQuery } from "@tanstack/react-query";
import { evenementUnique } from "../types/TypesEvenements";

export function useGetEvenementUnique(id : string) {
  return useQuery<evenementUnique>({
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
