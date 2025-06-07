import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Classementjoueurreponse } from "../type/TypesClassementjoueurs";

export function useClassementJoueurs() {
  return useQuery({
    queryKey: ["classement-joueurs"],
    queryFn: async () => {
      const { data } = await axios.get<Classementjoueurreponse>(
        "/api/statistiques/joueurs"
      );
      return data;
    },
  });
}