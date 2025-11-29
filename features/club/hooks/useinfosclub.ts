import { Equipe, MembreEquipe, User, Blessure } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

export type BlessureInfo = Pick<
  Blessure,
  "id" | "type" | "startDate" | "endDate" | "description"
>;

export type UserWithBlessures = Pick<User, "name" | "image" | "email"> & {
  blessures: BlessureInfo[];
};

export type MembreEquipeWithUser = MembreEquipe & {
  user: UserWithBlessures;
  isInjured: boolean;
};

export type InfosClubApiResponse = {
  equipe: Equipe;
  membres: MembreEquipeWithUser[];
  role: string;
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
