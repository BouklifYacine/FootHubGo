import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ApiAccueil } from "../interfaces/InterfaceApiAccueil";

export function UseDataAccueil() {
  return useQuery<ApiAccueil>({
    queryKey: ["accueil"],
    queryFn: async () => {
      const { data } = await axios.get<ApiAccueil>("/api/accueil");
      return data;
    },
  });
}