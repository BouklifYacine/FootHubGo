import { Equipe, MembreEquipe, User } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

export type MembreEquipeWithUser = MembreEquipe & { user: User };
export type InfosClubApiResponse = {
  equipe: Equipe;
  membres: MembreEquipeWithUser[];
  role: string; //
};

export function useInfosClub() {
  return useQuery<InfosClubApiResponse>({
    queryKey: ["infosclub"],
    queryFn: async () => {
      const res = await fetch("/api/infosclub");
      if (!res.ok) {
        throw new Error(await res.text());
      }
      return res.json() as Promise<InfosClubApiResponse>;
    },
  });
}