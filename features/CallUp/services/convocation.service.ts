// lib/services/convocation.service.ts

import axios from 'axios';
import { CallUpResponse } from '../interfaces/CallUpInterface';


export const convocationService = {
  callUpPlayer: async (teamId: string, playerId: string): Promise<CallUpResponse> => {
    const { data } = await axios.post<CallUpResponse>(
      `/api/evenements/${teamId}/convocation/${playerId}`
    );
    return data;
  },
};
