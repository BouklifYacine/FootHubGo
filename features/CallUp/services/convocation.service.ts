import axios from 'axios';
import { CallUpResponse } from '../interfaces/CallUpInterface';

export const convocationService = {
  callUpPlayer: async (eventId: string, playerId: string): Promise<CallUpResponse> => {
    const { data } = await axios.post<CallUpResponse>(
      `/api/evenements/${eventId}/convocation/${playerId}`
    );
    return data;
  },
};
