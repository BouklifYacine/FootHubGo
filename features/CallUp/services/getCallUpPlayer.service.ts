import { getCallUpApiResponse } from "../interfaces/getCallUpPlayerInterface";

export const getCallUpPlayerService = {
  getCallUp: async (): Promise<getCallUpApiResponse> => {
    const response = await fetch("/api/convocations/joueur");
    const data: getCallUpApiResponse = await response.json();
    return data;
  },
};
