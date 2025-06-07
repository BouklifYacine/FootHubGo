import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ClassementEquipeReponse } from "../types/StatsEquipestypes";

export function useClassementEquipe() {
  return useQuery({
    queryKey: ["classement-équipes"],
    queryFn: async () => {
      const { data } = await axios.get<ClassementEquipeReponse>(
        "/api/statistiques/equipes"
      );
      return data;
    },
  });
}