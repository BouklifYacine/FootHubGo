import ky from "ky";
import type { CreateInjuryTypeAPI } from "../types/CreateInjuries.types";

export const CreateInjuryService = {
  createinjuryresponse: async (json: Partial<CreateInjuryTypeAPI["injuryType"]>) => {
    const data = await ky.post(`/api/injuries`, { json }).json<CreateInjuryTypeAPI>();

    return data;
  },
};
