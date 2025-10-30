import ky from "ky";
import { CallUpResponseByPlayerServiceApi } from "../interfaces/CallUpResponseByPlayerInterface";

export const CallUpResponseByPlayerService = {
  callUpResponse: async (callUpId: string, statut: "CONFIRME" | "REFUSE") => {
    const data = await ky
      .patch(`/api/convocations/${callUpId}/reponse`, { json: { statut } })
      .json<CallUpResponseByPlayerServiceApi>();

    return data;
  },
};
