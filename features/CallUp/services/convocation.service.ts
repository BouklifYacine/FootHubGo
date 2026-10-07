import ky from 'ky';
import { CallUpResponse } from '../interfaces/CallUpInterface';

export const convocationService = {
  callUpPlayer: async (eventId: string, playerId: string): Promise<CallUpResponse> => {
    return ky
      .post(`/api/evenements/${eventId}/convocation/${playerId}`)
      .json<CallUpResponse>();
  },
};
