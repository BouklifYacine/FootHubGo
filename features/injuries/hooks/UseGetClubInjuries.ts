import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import { Blessure } from "@prisma/client";

type PlayerWithStats = {
  id: string;
  name: string;
  image: string | null;
  activeInjury: Blessure | null;
  totalInjuries: number;
};

type ClubInjuriesResponse = {
  players: PlayerWithStats[];
};

export function useClubInjuries(clubId: string) {
  return useQuery({
    queryKey: ["clubInjuries", clubId],
    queryFn: async () => {
      const data = await ky
        .get(`/api/injuries/club/${clubId}`)
        .json<ClubInjuriesResponse>();
      return data.players;
    },
    enabled: !!clubId,
  });
}
