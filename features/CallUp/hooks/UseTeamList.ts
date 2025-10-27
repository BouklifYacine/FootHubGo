import { useQuery } from "@tanstack/react-query";
import {TeamListInterfaceAPI} from "../interfaces/CallUpInterface";

export function UseTeamList(teamId?: string, eventId ?:string) {
  return useQuery<TeamListInterfaceAPI>({
    queryKey: ["TeamList", teamId, eventId],
    queryFn: async () => {
      const res = await fetch(`/api/equipes/${teamId}/evenements/${eventId}/convocation`);
      if (!res.ok) {
        throw new Error(await res.text());
      }
      return res.json() as Promise<TeamListInterfaceAPI>;
    },
     enabled: !!teamId && !!eventId,
  });
}