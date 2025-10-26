import { useQuery } from "@tanstack/react-query";
import {TeamListInterface} from "../interfaces/CallUpInterface";

export function UseTeamList(TeamId?: string) {
  return useQuery<TeamListInterface>({
    queryKey: ["TeamList", TeamId],
    queryFn: async () => {
      const res = await fetch(`/api/equipes/${TeamId}/convocations`);
      if (!res.ok) {
        throw new Error(await res.text());
      }
      return res.json() as Promise<TeamListInterface>;
    },
     enabled: !!TeamId,
  });
}