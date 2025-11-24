import ky from "ky";
import type { CreateInjuryTypeAPI } from "../types/CreateInjuries.types";
import { Blessure } from "@prisma/client";

type SingleInjuryResponse = {
  injury: Blessure;
};

export const InjuryService = {
  getInjuryById: async (id: string) => {
    const data = await ky
      .get(`/api/injuries/${id}`)
      .json<SingleInjuryResponse>();
    return data.injury;
  },

  getInjuriesByPlayerId: async (playerId: string) => {
    const data = await ky
      .get(`/api/injuries/player/${playerId}`)
      .json<{ injuries: Blessure[] }>();
    return data.injuries;
  },

  createInjury: async (json: Partial<CreateInjuryTypeAPI["injuryType"]>) => {
    const data = await ky
      .post(`/api/injuries`, { json })
      .json<CreateInjuryTypeAPI>();

    return data;
  },

  updateInjury: async (
    id: string,
    json: Partial<CreateInjuryTypeAPI["injuryType"]>
  ) => {
    const data = await ky
      .patch(`/api/injuries/${id}`, { json })
      .json<SingleInjuryResponse>();
    return data;
  },

  deleteInjury: async (id: string) => {
    return await ky.delete(`/api/injuries/${id}`).json<{ message: string }>();
  },
};
