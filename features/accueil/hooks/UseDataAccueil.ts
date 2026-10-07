import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import { ApiAccueil } from "../interfaces/InterfaceApiAccueil";

export function UseDataAccueil() {
  return useQuery<ApiAccueil>({
    queryKey: ["accueil"],
    queryFn: async () => {
      return ky.get("/api/accueil").json<ApiAccueil>();
    },
  });
}