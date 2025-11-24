import { useQuery } from "@tanstack/react-query";
import { InjuryService } from "../services/InjuryService";

export function usePlayerInjuries(playerId: string) {
  return useQuery({
    queryKey: ["playerInjuries", playerId],
    queryFn: () => InjuryService.getInjuriesByPlayerId(playerId),
    enabled: !!playerId,
  });
}
