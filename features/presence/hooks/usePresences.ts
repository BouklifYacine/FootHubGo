import { useQuery } from "@tanstack/react-query";
import { Presence } from "../types/Presencetypes";
import axios from "axios";

export const usePresences = (evenementId: string) => {
  return useQuery({
    queryKey: ["presences", evenementId],
    queryFn: async () => {
      const { data } = await axios.get<Presence[]>(`/api/evenement/${evenementId}/presence`);
      return data;
    },
    enabled: !!evenementId,
    staleTime: 1000 * 60 * 5, 
  });
};