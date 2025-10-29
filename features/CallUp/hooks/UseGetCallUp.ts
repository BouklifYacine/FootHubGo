import { useQuery } from "@tanstack/react-query";
import { getCallUpApiResponse } from "../interfaces/getCallUpPlayerInterface";
import { getCallUpPlayerService } from "../services/getCallUpPlayer.service";

export function useGetCallUp() {
  return useQuery<getCallUpApiResponse>({
    queryKey: ["useGetCallUp"],
    queryFn: getCallUpPlayerService.getCallUp
  });
}